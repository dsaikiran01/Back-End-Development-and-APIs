/* ****************
TESTS MADE TO MANUALLY CHECK MY TESTCASES AND OUTPUTS
******************* */

// The array of strings
const dynamicStrings = [ 
    "",
    "2024-02-02", 
    "2024-2-2",
    "0001-2-2" ,
    "1-2-2" ,
    "2024-299-200" ,
    "8.64e15",
    "99, 5, 24" ,
    "99,5,24" ,
    "99 5 24" ,
    "2024 02 24", 
    "20-02-2024" 
  ];

// The base URL
const baseUrl = "http://localhost:3000/api/";

async function testBackend(dynamicPath) {
  try {
    const fullUrl = `${baseUrl}${dynamicPath}`;

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json(); 
      console.log(dynamicPath, " : ", data);
    } else {
      console.error('Failed to test backend:', response.status); 
    }
  } catch (error) {
    console.error('Error testing the backend:', error);
  }
}

dynamicStrings.map(path => testBackend(path));
