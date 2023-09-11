import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import https from 'https';

// Define a type for the expected shape of the API response
interface ApiResponse {
  status: boolean;
  username: string; // Add other properties as needed
}

// Define a function to make the API call
async function makeApiCall(username: string, password: string): Promise<ApiResponse> {
  const options = {
    method: 'POST',
    hostname: 'restapi.tu.ac.th',
    path: '/api/v1/auth/Ad/verify',
    headers: {
      'Content-Type': 'application/json',
      'Application-Key': process.env.TU_API_SECRET as string,
    },
  };

  return new Promise<ApiResponse>((resolve, reject) => {
    const req = https.request(options, (res) => {
      const chunks: Buffer[] = []; // Provide explicit type information here

      res.on("data", (chunk) => {
        chunks.push(chunk);
      });

      res.on("end", () => {
        const body = Buffer.concat(chunks);
        const response = JSON.parse(body.toString()) as ApiResponse;
        resolve(response);
      });

      res.on("error", (error) => {
        console.error(error);
        reject(error);
      });
    });

    const postData = JSON.stringify({
      UserName: username,
      PassWord: password,
    });

    req.write(postData);
    req.end();
  });
}

export const options: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: {
          label: "Username:",
          type: "text",
          placeholder: "your-cool-username",
        },
        password: {
          label: "Password:",
          type: "password",
          placeholder: "your-awesome-password",
        },
      },
      async authorize(credentials) {
        if (!credentials || !credentials.username || !credentials.password) {
          // Credentials are missing or incomplete
          throw new Error('Missing credentials');
        }

        try {
          // Use the type assertion 'as ApiResponse' to specify the expected shape
          const apiResponse = await makeApiCall(credentials.username, credentials.password) as ApiResponse;

          if (apiResponse.status === true) {
            // Extract relevant user information and create the user object
            const {
              username,
              // Add other properties as needed
            } = apiResponse;

            const user = {
              id: username,
              // Add other user properties as needed
            };

            return Promise.resolve(user);
          } else {
            throw new Error('Authentication failed');
          }
        } catch (error) {
          console.error(error);
          throw new Error('Authentication failed');
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET as string,
};
