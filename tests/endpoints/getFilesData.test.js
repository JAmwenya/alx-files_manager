const request = require('supertest');
const app = require('./server'); // Import your Express app

describe('GET /files/:id/data', () => {
  it('should return data for the specified file ID', async () => {
    // Define a file ID for an existing file in your application
    const fileId = 'YOUR_FILE_ID';

    const response = await request(app)
      .get(`/files/${fileId}/data`);

    expect(response.status).toBe(200);
    // Add expectations for the response body based on your application's behavior
  });
});