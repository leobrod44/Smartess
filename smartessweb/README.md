### NOTE
- There are 2 section. The first section will explain how to setup your environment. The second section will tell you about how to run the API.

### One-time Instructions:

There is a security aspect which requires setting a .env file. This needs to be done only once initially. You will also need to setup a docker network for the first time. For running instructions just head over to the next section below.

1. Locate the smartessweb folder:

   ![image](https://github.com/user-attachments/assets/18494e02-1b17-4a34-beb2-f8c83e58d367)


2. Install create a .env file like the following:

   ![image](https://github.com/user-attachments/assets/359a96da-33f7-4f03-aac0-44b693c58855)


3. Paste the following code:

```bash
   SUPABASE_URL="URL"
   SUPABASE_ANON_KEY="KEY"
   RESEND_API_KEY="KEY"
   RESEND_DOMAIN ="DOMAIN"
   RESEND_EMAIL_TO ="YOUR EMAIL"
   PORT = 3000
```

4. DM Abdullah. He will provide you with the URL and key. For TAs and Prof, refer to the presentation slides. A link is shared to download this.

5. Replace the values accordingly.

6. In your code editor terminal go to the correct folder/directory (it is "smartessweb"). For reference, here is how mine looks:

   ```bash
     PS C:\Users\Abdullah\Desktop\Fall2024\SOEN490\Capstone\Smartess>
   ```

7. Make docker network called smartess_web:

   ```bash
      docker network create smartess_network
   ```

For any question DM Abdullah.

### Running Instructions:

1. In your code editor terminal go to the correct folder/directory (it is "smartessweb"). For reference, here is how mine looks:

2. Type the following command and press enter:

   ```bash
      docker-compose up --build smartessweb
   ```

   NOTEs: 
      -Give some time to initially build it. Usually it should take 50s but wait 5 min (may depend on computer's hardware).
      -We are only running the smartess web from this command. We will be needing to run the whole docker compose file later in the project. The instructions will be updated accordingly. 


4. Open your broswer and type :

   ```bash
     http://localhost:3001/
   ```

   You should see the app will be lauched on this page:

   ![image](https://github.com/user-attachments/assets/ecb51ebd-34fe-412b-a0c4-436c7bf8bba5)


