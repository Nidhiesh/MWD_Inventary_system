const http = require('http');

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}`;

// Helper to make HTTP requests using Node.js native http module
const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${path}`;
    const parsedUrl = new URL(url);

    const headers = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: method,
      headers: headers
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: parsedData
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            raw: data
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('==================================================');
  console.log('STARTING SMARTSTOCK BACKEND INTEGRATION TEST SUITE');
  console.log('==================================================\n');

  try {
    // Test 1: Root endpoint
    console.log('1. Testing Server Root Endpoint...');
    const rootRes = await request('GET', '/');
    console.log(`Status: ${rootRes.status}`);
    console.log(`Response:`, rootRes.data);
    if (rootRes.status !== 200) throw new Error('Root endpoint failed');
    console.log('SUCCESS\n');

    // Generate random email to prevent collisions on rerun
    const rand = Math.floor(Math.random() * 100000);
    const email = `admin_${rand}@smartstock.com`;
    const password = 'password123';

    // Test 2: Register Admin
    console.log(`2. Testing User Registration (${email})...`);
    const regRes = await request('POST', '/api/auth/register', {
      name: 'Admin User',
      email: email,
      password: password,
      role: 'ADMIN'
    });
    console.log(`Status: ${regRes.status}`);
    console.log(`Response:`, regRes.data);
    if (regRes.status !== 201) throw new Error('Registration failed');
    console.log('SUCCESS\n');

    // Test 3: Login User
    console.log('3. Testing User Login...');
    const loginRes = await request('POST', '/api/auth/login', {
      email,
      password
    });
    console.log(`Status: ${loginRes.status}`);
    console.log(`Response:`, loginRes.data);
    if (loginRes.status !== 200) throw new Error('Login failed');
    const token = loginRes.data.data.token;
    console.log('SUCCESS\n');

    // Test 4: Get Me Profile
    console.log('4. Testing GET /api/auth/me profile...');
    const profileRes = await request('GET', '/api/auth/me', null, token);
    console.log(`Status: ${profileRes.status}`);
    console.log(`Response:`, profileRes.data);
    if (profileRes.status !== 200) throw new Error('Get profile failed');
    console.log('SUCCESS\n');

    // Test 5: Create Category
    console.log('5. Testing Category Creation...');
    const catRes = await request('POST', '/api/categories', {
      name: `Electronics_${rand}`,
      description: 'Devices and gadgets'
    }, token);
    console.log(`Status: ${catRes.status}`);
    console.log(`Response:`, catRes.data);
    if (catRes.status !== 201) throw new Error('Category creation failed');
    const categoryId = catRes.data.data._id;
    console.log('SUCCESS\n');

    // Test 6: Create Supplier
    console.log('6. Testing Supplier Creation...');
    const supRes = await request('POST', '/api/suppliers', {
      name: 'John Supplier',
      company: `LogiTech_${rand}`,
      email: 'logitech@supplier.com',
      phone: '1234567890',
      address: '123 Tech Way'
    }, token);
    console.log(`Status: ${supRes.status}`);
    console.log(`Response:`, supRes.data);
    if (supRes.status !== 201) throw new Error('Supplier creation failed');
    const supplierId = supRes.data.data._id;
    console.log('SUCCESS\n');

    // Test 7: Create Product (starting qty 0)
    console.log('7. Testing Product Creation...');
    const sku = `MS-WIRELESS-${rand}`;
    const prodRes = await request('POST', '/api/products', {
      name: 'Wireless Ergonomic Mouse',
      sku: sku,
      description: 'High precision wireless mouse',
      category: categoryId,
      supplier: supplierId,
      purchasePrice: 15,
      sellingPrice: 40,
      quantity: 0,
      minimumStock: 10,
      maximumStock: 150,
      warehouse: 'Warehouse A'
    }, token);
    console.log(`Status: ${prodRes.status}`);
    console.log(`Response:`, prodRes.data);
    if (prodRes.status !== 201) throw new Error('Product creation failed');
    const productId = prodRes.data.data._id;
    console.log('SUCCESS\n');

    // Test 8: Verify duplicate SKU is rejected
    console.log('8. Testing Duplicate SKU Rejection...');
    const dupSkuRes = await request('POST', '/api/products', {
      name: 'Other Mouse',
      sku: sku, // duplicate
      category: categoryId,
      supplier: supplierId,
      purchasePrice: 12,
      sellingPrice: 30
    }, token);
    console.log(`Status (Expected: 409): ${dupSkuRes.status}`);
    console.log(`Response:`, dupSkuRes.data);
    if (dupSkuRes.status !== 409) throw new Error('Duplicate SKU was not rejected');
    console.log('SUCCESS\n');

    // Test 9: Create Purchase Order (PENDING)
    console.log('9. Testing Purchase Order Creation...');
    const purchaseRes = await request('POST', '/api/purchases', {
      supplier: supplierId,
      items: [
        {
          product: productId,
          quantity: 100,
          price: 15
        }
      ]
    }, token);
    console.log(`Status: ${purchaseRes.status}`);
    console.log(`Response:`, purchaseRes.data);
    if (purchaseRes.status !== 201) throw new Error('Purchase creation failed');
    const purchaseId = purchaseRes.data.data._id;
    console.log('SUCCESS\n');

    // Test 10: Receive Purchase Order (transitions to RECEIVED, increases stock to 100)
    console.log('10. Testing Receiving Purchase Order (Increases Stock)...');
    const receiveRes = await request('PUT', `/api/purchases/${purchaseId}`, {
      status: 'RECEIVED'
    }, token);
    console.log(`Status: ${receiveRes.status}`);
    console.log(`Response:`, receiveRes.data);
    if (receiveRes.status !== 200) throw new Error('Receive purchase failed');
    console.log('SUCCESS\n');

    // Test 11: Verify Product Stock Increased
    console.log('11. Verifying Product Stock level is 100...');
    const checkProductRes = await request('GET', `/api/products/${productId}`, null, token);
    console.log(`Status: ${checkProductRes.status}`);
    console.log(`Stock level (Expected: 100): ${checkProductRes.data.data.quantity}`);
    if (checkProductRes.data.data.quantity !== 100) throw new Error('Product stock not increased correctly');
    console.log('SUCCESS\n');

    // Test 12: Create Customer
    console.log('12. Testing Customer Creation...');
    const customerRes = await request('POST', '/api/customers', {
      name: 'Alice Client',
      email: 'alice@client.com',
      phone: '9876543210',
      address: '456 Main St'
    }, token);
    console.log(`Status: ${customerRes.status}`);
    console.log(`Response:`, customerRes.data);
    if (customerRes.status !== 201) throw new Error('Customer creation failed');
    const customerId = customerRes.data.data._id;
    console.log('SUCCESS\n');

    // Test 13: Create Sale (decreases stock to 92)
    console.log('13. Testing Sale Creation (Decreases Stock)...');
    const saleRes = await request('POST', '/api/sales', {
      customer: customerId,
      items: [
        {
          product: productId,
          quantity: 8
        }
      ],
      tax: 5,
      discount: 2,
      paymentMethod: 'CASH',
      paymentStatus: 'PAID'
    }, token);
    console.log(`Status: ${saleRes.status}`);
    console.log(`Response:`, saleRes.data);
    if (saleRes.status !== 201) throw new Error('Sale creation failed');
    console.log('SUCCESS\n');

    // Test 14: Verify Product Stock Decreased
    console.log('14. Verifying Product Stock level is 92...');
    const checkProductRes2 = await request('GET', `/api/products/${productId}`, null, token);
    console.log(`Status: ${checkProductRes2.status}`);
    console.log(`Stock level (Expected: 92): ${checkProductRes2.data.data.quantity}`);
    if (checkProductRes2.data.data.quantity !== 92) throw new Error('Product stock not decreased correctly');
    console.log('SUCCESS\n');

    // Test 15: Attempt Sale exceeding available stock (e.g. quantity 150)
    console.log('15. Testing Sale exceeding available stock (Expected Failure)...');
    const failSaleRes = await request('POST', '/api/sales', {
      customer: customerId,
      items: [
        {
          product: productId,
          quantity: 150
        }
      ],
      paymentMethod: 'CASH'
    }, token);
    console.log(`Status (Expected: 400): ${failSaleRes.status}`);
    console.log(`Response:`, failSaleRes.data);
    if (failSaleRes.status !== 400) throw new Error('Sale exceeding stock was not blocked');
    console.log('SUCCESS\n');

    // Test 16: Check Low Stock warning via direct adjustment (setting qty to 5, min is 10)
    console.log('16. Adjusting stock to trigger Low Stock Alert...');
    const adjustRes = await request('POST', '/api/inventory/adjust', {
      productId: productId,
      newQty: 5,
      notes: 'Adjust to low stock level for testing'
    }, token);
    console.log(`Status: ${adjustRes.status}`);
    console.log(`New Stock Level (Expected: 5): ${adjustRes.data.data.quantity}`);
    if (adjustRes.data.data.quantity !== 5) throw new Error('Stock adjustment failed');
    console.log('SUCCESS\n');

    // Test 17: Get Low Stock Products list
    console.log('17. Testing GET /api/inventory/low-stock list...');
    const lowStockListRes = await request('GET', '/api/inventory/low-stock', null, token);
    console.log(`Status: ${lowStockListRes.status}`);
    console.log(`Low Stock count: ${lowStockListRes.data.data.length}`);
    if (lowStockListRes.status !== 200) throw new Error('Get low stock list failed');
    console.log('SUCCESS\n');

    // Test 18: Get Notifications
    console.log('18. Testing GET /api/notifications...');
    const notifRes = await request('GET', '/api/notifications', null, token);
    console.log(`Status: ${notifRes.status}`);
    console.log(`Notifications count: ${notifRes.data.data.length}`);
    console.log(`Latest notification:`, notifRes.data.data[0]);
    if (notifRes.status !== 200) throw new Error('Get notifications failed');
    console.log('SUCCESS\n');

    // Test 19: Get Dashboard metrics
    console.log('19. Testing GET /api/dashboard metrics...');
    const dashRes = await request('GET', '/api/dashboard', null, token);
    console.log(`Status: ${dashRes.status}`);
    console.log(`Dashboard data:`, dashRes.data.data);
    if (dashRes.status !== 200) throw new Error('Get dashboard metrics failed');
    console.log('SUCCESS\n');

    // Test 20: Get Reports
    console.log('20. Testing Reports (GET /api/reports/inventory)...');
    const repRes = await request('GET', '/api/reports/inventory', null, token);
    console.log(`Status: ${repRes.status}`);
    console.log(`Report summary:`, repRes.data.data.summary);
    if (repRes.status !== 200) throw new Error('Get inventory report failed');
    console.log('SUCCESS\n');

    // Test 21: Get Audit Logs
    console.log('21. Testing GET /api/audit-logs...');
    const auditRes = await request('GET', '/api/audit-logs', null, token);
    console.log(`Status: ${auditRes.status}`);
    console.log(`Logs count: ${auditRes.data.data.length}`);
    console.log(`Latest audit entry:`, auditRes.data.data[0]);
    if (auditRes.status !== 200) throw new Error('Get audit logs failed');
    console.log('SUCCESS\n');

    console.log('==================================================');
    console.log('ALL BACKEND INTEGRATION TESTS COMPLETED SUCCESSFULLY!');
    console.log('==================================================');

  } catch (error) {
    console.error('==================================================');
    console.error('INTEGRATION TEST RUNTIME FAILURE:');
    console.error(error.message);
    console.error('==================================================');
    process.exit(1);
  }
};

runTests();
