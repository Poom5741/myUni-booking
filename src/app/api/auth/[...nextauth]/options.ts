import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import https from 'https';

// Define a function to make the API call
async function makeApiCall(username, password) {
    const options = {
        method: 'POST',
        hostname: 'restapi.tu.ac.th',
        path: '/api/v1/auth/Ad/verify',
        headers: {
            'Content-Type': 'application/json',
            'Application-Key': 'TU7f11b30d67bd70bfa415db7e6352c8076e04bf9536a9e2ed7416e209d1e7896cd8da668be8ac169f93d35e44963b62e5'
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            const chunks = [];

            res.on("data", (chunk) => {
                chunks.push(chunk);
            });

            res.on("end", () => {
                const body = Buffer.concat(chunks);
                const response = JSON.parse(body.toString());
                resolve(response);
            });

            res.on("error", (error) => {
                console.error(error);
                reject(error);
            });
        });

        const postData = JSON.stringify({
            UserName: username,
            PassWord: password
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
                    placeholder: "your-cool-username"
                },
                password: {
                    label: "Password:",
                    type: "password",
                    placeholder: "your-awesome-password"
                }
            },
            async authorize(credentials) {
                try {
                    const apiResponse = await makeApiCall(credentials.username, credentials.password);
                    
                    if (apiResponse.status === true) {
                        // Extract relevant user information and create the user object
                        const {
                            username,
                            displayname_th,
                            displayname_en,
                            email,
                            department,
                            faculty,
                        } = apiResponse;

                        const user = {
                            id: username,
                            name: displayname_th || displayname_en,
                            email,
                            department,
                            faculty,
                        };

                        return Promise.resolve(user);
                    } else {
                        throw new Error('Authentication failed');
                    }
                } catch (error) {
                    console.error(error);
                    throw new Error('Authentication failed');
                }
            }
        })
    ],
    secret: process.env.NEXTAUTH_SECRET as string,
};
