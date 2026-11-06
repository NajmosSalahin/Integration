import User from '../models/User.js';
import {
  generateAccessToken,
  verifyRefreshToken,
  setRefreshCookie,
  clearRefreshCookie,
  generateEmailToken,
  hashToken,
} from '../utils/token.js';
import { createVerification } from '../utils/verification.js';
import { sessionStore } from '../utils/session.js';
import { sendVerificationEmail } from '../emails/verification.js';
import { sendResetPasswordEmail } from '../emails/resetPassword.js';
import { sendAccountExistsEmail } from '../emails/accountExists.js';
import { verifyLoginPassword } from '../utils/loginPassword.js';
import cloudinary from '../utils/cloudinary.js';

function formatUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    permissions: user.permissions || [],
    emailVerified: user.emailVerified,
    phone: user.phone || '',
    avatar: user.avatar || '',
    notificationPrefs: {
      orderUpdates: user.notificationPrefs?.orderUpdates ?? true,
      newDrops: user.notificationPrefs?.newDrops ?? true,
    },
    addresses: (user.addresses || []).map((a) => a.toObject()),
    wishlist: (user.wishlist || []).map((id) => id.toString()),
  };
}

export async function signup(req, res) {
  try {
    const { name, email, password } = req.body;

    const passwordHash = await User.hashPassword(password);
    const verification = createVerification();

    try {
      await User.create({
        name,
        email,
        passwordHash,
        verificationToken: verification.tokenHash,
        verificationExpires: verification.expiresAt,
      });
    } catch (err) {
      if (err?.code === 11000) {
        try {
          await sendAccountExistsEmail(email);
        } catch (emailErr) {
          console.error('Failed to send account exists email:', emailErr);
        }
        return res.status(201).json({ message: 'Check your email to continue' });
      }
      throw err;
    }

    try {
      await sendVerificationEmail(email, verification.token);
    } catch (emailErr) {
      console.error('Failed to send verification email:', emailErr);
    }

    res.status(201).json({ message: 'Check your email to continue' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Failed to create account' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    const isMatch = await verifyLoginPassword(user, password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const { refreshToken, sessionId } = await sessionStore.createSession(user);
    const accessToken = generateAccessToken(user, sessionId);
    setRefreshCookie(res, refreshToken);

    res.json({
      accessToken,
      user: formatUser(user),
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Failed to log in' });
  }
}

export async function logout(req, res) {
  try {
    await sessionStore.revokeSession(req.cookies?.refreshToken);
  } catch (err) {
    console.error('Failed to revoke session:', err);
  }
  clearRefreshCookie(res);
  res.json({ message: 'Logged out successfully' });
}

export async function refresh(req, res) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ error: 'No refresh token' });
    }

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const rotated = await sessionStore.rotateSession(token, decoded, user);
    if (!rotated) {
      clearRefreshCookie(res);
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const accessToken = generateAccessToken(user, rotated.sessionId);
    if (rotated.refreshToken) {
      setRefreshCookie(res, rotated.refreshToken);
    }

    res.json({ accessToken });
  } catch (err) {
    clearRefreshCookie(res);
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
}

export async function getMe(req, res) {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(formatUser(user));
  } catch (err) {
    console.error('getMe error:', err);
    res.status(500).json({ error: 'Failed to get user' });
  }
}

export async function verifyEmail(req, res) {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const tokenHash = hashToken(token);
    const user = await User.findOne({
      verificationToken: tokenHash,
      verificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    console.error('Verify email error:', err);
    res.status(500).json({ error: 'Failed to verify email' });
  }
}

export async function resendVerification(req, res) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.emailVerified) {
      return res.json({ message: 'Email already verified' });
    }

    const verification = createVerification();
    user.verificationToken = verification.tokenHash;
    user.verificationExpires = verification.expiresAt;
    await user.save();

    try {
      await sendVerificationEmail(user.email, verification.token);
    } catch (emailErr) {
      console.error('Failed to send verification email:', emailErr);
    }

    res.json({ message: 'Verification email sent' });
  } catch (err) {
    console.error('Resend verification error:', err);
    res.status(500).json({ error: 'Failed to send verification email' });
  }
}

export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ message: 'If an account exists, a reset email has been sent' });
    }

    const resetToken = generateEmailToken();
    const resetTokenHash = hashToken(resetToken);

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    try {
      await sendResetPasswordEmail(email, resetToken);
    } catch (emailErr) {
      console.error('Failed to send reset email:', emailErr);
    }

    res.json({ message: 'If an account exists, a reset email has been sent' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Failed to process request' });
  }
}

export async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;

    const tokenHash = hashToken(token);
    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    user.passwordHash = await User.hashPassword(password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    await sessionStore.revokeAllSessions(user._id);

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
}

export async function updateMe(req, res) {
  try {
    const { name, phone, notificationPrefs } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (notificationPrefs) {
      if (typeof notificationPrefs.orderUpdates === 'boolean') {
        user.notificationPrefs.orderUpdates = notificationPrefs.orderUpdates;
      }
      if (typeof notificationPrefs.newDrops === 'boolean') {
        user.notificationPrefs.newDrops = notificationPrefs.newDrops;
      }
    }
    await user.save();

    res.json(formatUser(user));
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
}

export async function uploadAvatar(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'integration/avatars', width: 512, height: 512, crop: 'limit' },
        (err, image) => (err ? reject(err) : resolve(image))
      );
      stream.end(req.file.buffer);
    });

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    user.avatar = result.secure_url;
    await user.save();

    res.json({ avatar: user.avatar });
  } catch (err) {
    console.error('Avatar upload error:', err);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
}

export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    user.passwordHash = await User.hashPassword(newPassword);
    await user.save();
    await sessionStore.revokeAllSessions(user._id);

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Failed to change password' });
  }
}

export async function toggleWishlist(req, res) {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const index = user.wishlist.findIndex((id) => id.toString() === productId);
    if (index >= 0) {
      user.wishlist.splice(index, 1);
    } else {
      user.wishlist.push(productId);
    }
    await user.save();

    res.json({ wishlist: user.wishlist.map((id) => id.toString()) });
  } catch (err) {
    console.error('Toggle wishlist error:', err);
    res.status(500).json({ error: 'Failed to update wishlist' });
  }
}

export async function addAddress(req, res) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isDefault = user.addresses.length === 0 || req.body.isDefault;
    if (isDefault) {
      user.addresses.forEach((a) => { a.isDefault = false; });
    }
    user.addresses.push({ ...req.body, isDefault });

    await user.save();
    res.status(201).json({ addresses: user.addresses.map((a) => a.toObject()) });
  } catch (err) {
    console.error('Add address error:', err);
    res.status(500).json({ error: 'Failed to add address' });
  }
}

export async function updateAddress(req, res) {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({ error: 'Address not found' });
    }

    if (req.body.isDefault) {
      user.addresses.forEach((a) => { a.isDefault = false; });
    } else if (req.body.isDefault === false && address.isDefault) {
      return res.status(400).json({ error: 'Set another default address first' });
    }

    Object.entries(req.body).forEach(([key, value]) => {
      if (key !== 'isDefault') address[key] = value;
    });
    if (req.body.isDefault !== undefined) address.isDefault = req.body.isDefault;

    await user.save();
    res.json({ addresses: user.addresses.map((a) => a.toObject()) });
  } catch (err) {
    console.error('Update address error:', err);
    res.status(500).json({ error: 'Failed to update address' });
  }
}

export async function deleteAddress(req, res) {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({ error: 'Address not found' });
    }

    const wasDefault = address.isDefault;
    address.deleteOne();
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    res.json({ addresses: user.addresses.map((a) => a.toObject()) });
  } catch (err) {
    console.error('Delete address error:', err);
    res.status(500).json({ error: 'Failed to delete address' });
  }
}

export async function setDefaultAddress(req, res) {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({ error: 'Address not found' });
    }

    user.addresses.forEach((a) => { a.isDefault = false; });
    address.isDefault = true;

    await user.save();
    res.json({ addresses: user.addresses.map((a) => a.toObject()) });
  } catch (err) {
    console.error('Set default address error:', err);
    res.status(500).json({ error: 'Failed to set default address' });
  }
}
