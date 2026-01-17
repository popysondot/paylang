
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = 'http://localhost:5000';

async function runTests() {
    console.log('🚀 Starting System Verification...\n');

    try {
        // 1. Test Public Settings
        console.log('📡 Testing Public Settings Endpoint...');
        const settingsRes = await axios.get(`${BASE_URL}/api/settings`);
        console.log('✅ Public Settings:', settingsRes.data);
        if (!settingsRes.data.company_name) throw new Error('Public settings missing company_name');

        // 2. Test Admin Login
        console.log('\n🔐 Testing Admin Login...');
        const loginRes = await axios.post(`${BASE_URL}/api/admin/login`, {
            username: 'admin',
            password: '@Dray101' // Default password from server/index.js
        });
        const token = loginRes.data.token;
        console.log('✅ Admin Login successful. Token received.');

        // 3. Test Protected Transactions
        console.log('\n📊 Testing Protected Transactions Endpoint...');
        const transRes = await axios.get(`${BASE_URL}/api/admin/transactions`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Transactions fetch successful. Found ${transRes.data.length} records.`);

        // 4. Test Admin Settings
        console.log('\n⚙️ Testing Admin Settings Fetch...');
        const adminSettingsRes = await axios.get(`${BASE_URL}/api/admin/settings`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Admin Settings retrieved successfully.');

        // 5. Test Audit Logs
        console.log('\n📜 Testing Audit Logs Fetch...');
        const auditRes = await axios.get(`${BASE_URL}/api/admin/audit-logs`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Audit logs retrieved. Found ${auditRes.data.length} events.`);

        console.log('\n✨ ALL BACKEND TESTS PASSED SUCCESSFULLY! ✨');
    } catch (error) {
        console.error('\n❌ Test Failed:');
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error('Data:', error.response.data);
        } else {
            console.error(error.message);
        }
        process.exit(1);
    }
}

runTests();
