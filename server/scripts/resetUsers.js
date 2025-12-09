const MongoManager = require('../db/mongodb/MongoManager');
const bcrypt = require('bcryptjs');
const testUsers = require('../test/data/test-users.json');

async function resetUsers() {
    console.log('Starting user reset...');

    const db = new MongoManager();
    await db.initialize();
    console.log('Connected to database');

    const User = require('../models/mongodb/user-model');

    const deleteResult = await User.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing users`);

    const password = 'password';
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    console.log('Password hashed');

    let successCount = 0;
    let errorCount = 0;

    for (const user of testUsers.users) {
        try {
            await db.createUser(
                user.name,
                user.email,
                passwordHash,
                null
            );
            successCount++;
            console.log(`Created user: ${user.name} (${user.email})`);
        } catch (error) {
            errorCount++;
            console.error(`Failed to create user ${user.name}:`, error.message);
        }
    }

    console.log('\nSummary:');
    console.log(`   Total users in file: ${testUsers.users.length}`);
    console.log(`   Successfully created: ${successCount}`);
    console.log(`   Errors: ${errorCount}`);
    console.log(`   Password for all users: "${password}"`);

    const mongoose = require('mongoose');
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    console.log('User reset complete!');
}

resetUsers()
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
