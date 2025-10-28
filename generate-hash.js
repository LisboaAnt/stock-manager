const bcrypt = require('bcrypt');

async function generateHash() {
  const password = '123456';
  const hash = await bcrypt.hash(password, 10);
  console.log('Hash for "123456":', hash);
}

generateHash();
