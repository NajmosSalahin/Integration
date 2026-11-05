import bcrypt from 'bcrypt';

export const DUMMY_PASSWORD_HASH = '$2b$12$dWWyQi26GoL77QHcTug7p..QGtmHAkB3F7DaQrm56E7Ytod55D1.u';

export async function verifyLoginPassword(user, password) {
  if (!user) {
    await bcrypt.compare(password, DUMMY_PASSWORD_HASH);
    return false;
  }

  return user.comparePassword(password);
}
