## IMPORTANT: How to use Docker

Everything is done for setting up docker for the next.js app (frontend). From here, it is better to install and learn to use docker. However it is possible to use npm commands to run for awhile BUT it is NOT RECOMMENDED.

Here are the steps to follow:

1. Install Docker: You can follow a video tutorial on how to install docker. We don't need to create anything just a tutorial that explains how to install it will be sufficient.

2. Open your project in your favorite code editor. This guide will be on VSCode.

3. Go to the correct directory or open the frontend folder. It should be something like 

    ```bash
    .../Smartess/smartessweb.
    ``` 

    Here is mine for example:
    ```bash
        PS C:\Users\Abdullah\Desktop\Fall2024\SOEN490\Capstone\Smartess\smartessweb>
    ```

    For development run the following code:
    ```bash
        docker-compose -f docker-compose-dev.yml up -d --build
    ```

    For production (you will not need it):
    ```bash
        docker-compose -f docker-compose-prod.yml up -d --build
    ```

    NOTE: It can take 3-8 mins when using the command the first time. Please contact Abdullah if you face any issues. 

4. On your web browser go to: http://localhost:3000/ (development) or http://localhost:8080/ (Production, Unlikely to use it)

5.  You are ready to code!

Ignore the guide below. It is created by Next.js by default and it will be removed later in the project.
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
