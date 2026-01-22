import pool from './server/config/db.js';
import bcrypt from 'bcryptjs';

const run = async () => {
    try {
        console.log("Testing InitDb SEEDS...");

        // Ensure tables exist first (assuming test_sqlite_2 was run before or DB exists)
        // Check if admin exists
        console.log("Checking admin...");
        const [users] = await pool.query("SELECT * FROM users WHERE email = 'admin@master.com'");

        if (users.length === 0) {
            console.log('Seeding Initial Data...');

            const adminPass = await bcrypt.hash('123', 10);
            const shopPass = await bcrypt.hash('123', 10);
            const staffPass = await bcrypt.hash('123', 10);

            console.log("Inserting Tenant...");
            await pool.query(
                "INSERT INTO tenants (id, name, owner_email, subscription_status) VALUES (?, ?, ?, ?)",
                ['tenant-1', 'Ali Shop', 'shop@test.com', 'active']
            );

            console.log("Inserting Plans...");
            await pool.query(
                "INSERT INTO plans (id, name, max_staff, max_shops, price, features) VALUES (?, ?, ?, ?, ?, ?)",
                ['plan-free', 'Free Tier', 5, 1, 0, 'basic']
            );
            await pool.query(
                "INSERT INTO plans (id, name, max_staff, max_shops, price, features) VALUES (?, ?, ?, ?, ?, ?)",
                ['plan-pro', 'Pro Tier', 50, 5, 29, 'advanced,export,priority_support']
            );

            console.log("Inserting Settings...");
            const defaultSettings = [
                { k: 'theme_mode', v: 'dark' },
                { k: 'qr_refresh_rate', v: '30' },
                { k: 'gps_radius', v: '100' },
                { k: 'max_devices_per_user', v: '1' }
            ];
            for (const s of defaultSettings) {
                await pool.query("INSERT OR IGNORE INTO global_settings (key, value) VALUES (?, ?)", [s.k, s.v]);
            }

            console.log("Inserting Shops...");
            await pool.query(
                "INSERT INTO shops (id, tenant_id, name, latitude, longitude) VALUES (?, ?, ?, ?, ?)",
                ['shop-1', 'tenant-1', 'Main Branch', 40.7128, -74.0060]
            );

            console.log("Inserting Users...");
            await pool.query(
                "INSERT INTO users (id, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)",
                ['super-1', 'admin@master.com', adminPass, 'Super Admin', 'super_admin']
            );

            await pool.query(
                "INSERT INTO users (id, tenant_id, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?, ?)",
                ['admin-1', 'tenant-1', 'shop@test.com', shopPass, 'Shop Owner', 'admin']
            );

            await pool.query(
                "INSERT INTO users (id, tenant_id, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?, ?)",
                ['staff-1', 'tenant-1', 'staff@test.com', staffPass, 'John Staff', 'staff']
            );

            console.log("Inserting Staff Details...");
            await pool.query(
                "INSERT INTO staff_details (user_id, role, branch, base_salary, payment_method) VALUES (?, ?, ?, ?, ?)",
                ['staff-1', 'Intern', 'Main Branch', 25000, 'cash']
            );

            console.log('Seed Data Created: admin@master.com / 123');
        } else {
            console.log('Database already initialized (admin exists).');
        }

    } catch (e) {
        console.error("Seeds Failed:", e);
    }
};
run();
