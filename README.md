# Smartess

## Release 1 Demo
https://drive.google.com/file/d/1VhbKIfahZcb6RqXoC6UfZoBpeX1w_sCs/view?usp=sharing

## Important files
### Top 5 files
  
| File path with clickable link | Purpose (1 line description) |
|------|------------|
|[go/hub/hub.go](https://github.com/leobrod44/Smartess/blob/main/go/hub/hub.go)|Intercepts hub events and logs to server|
|[go/server/rabbitmq/rabbitmq.go](https://github.com/leobrod44/Smartess/blob/main/go/server/rabbitmq/rabbitmq.go)|Server; main backend processor and orchestrator of microservices/managers|
|[smartessweb/frontend/src/app/dashboard/page.tsx](https://github.com/leobrod44/Smartess/blob/main/smartessweb/frontend/src/app/dashboard/page.tsx)|Dashboard page, main entry for multiple components. |
|[smartessweb/backend/app.js](https://github.com/leobrod44/Smartess/blob/main/smartessweb/backend/app.js)|Main entry for the backend (Web) and contains all routes|
|[smartessweb/frontend/src/app/components/DashboardNavbar.tsx](https://github.com/leobrod44/Smartess/blob/main/smartessweb/frontend/src/app/components/DashboardNavbar.tsx)|Navigation bar used across the whole web|
### Top 5 Tests
| File path with clickable link | Purpose (1 line description) |
|------|------------|
|[go/tests/event_test.go](https://github.com/leobrod44/Smartess/blob/main/go/tests/event_test.go)|Integration test for hub events interception|
|[smartessweb/backend/tests/controllers/authController.test.js](https://github.com/leobrod44/Smartess/blob/main/smartessweb/backend/tests/controllers/authController.test.js)|Tests behavior of web authorization system|
|[smartessweb/backend/tests/controllers/projectController.test.js](https://github.com/leobrod44/Smartess/blob/main/smartessweb/backend/tests/controllers/projectController.test.js)|Tests behavior of projects data retrieval for web|
|[smartessweb/backend/tests/controllers/hubcontroller.test.js](https://github.com/leobrod44/Smartess/blob/main/smartessweb/backend/tests/controllers/hubcontroller.test.js)|Tests behavior of hubs data retrieval for web|
|[smartessweb/frontend/__tests__/ProjectComponent.test.tsx](https://github.com/leobrod44/Smartess/blob/main/smartessweb/frontend/__tests__/ProjectComponent.test.tsx)|Test the frontend Project component’s behavior|

## CI information

In this project, we use a Continuous Integration (CI) pipeline to automate the development and testing of our application. The main tools involved are GitHub Actions for automation, Docker for containerization, Jest for testing, and ESLint for checking code quality. This combination of tools ensures that code is consistently tested and validated as soon as changes are made. This setup catches issues early in the development process, reducing the cost and effort required to fix them if they were discovered later in the development lifecycle.


## Project Summary 
Smartess is an all-in-one smart home system designed for condominium and residential communities. It serves both tenants and property owners, with tenants benefiting from a fully integrated smart home experience in their unit, while owners manage everything through a centralized application. This project involves building a web platform that property owners can use to monitor units and buildings in real-time. Data is collected through smart appliances and equipment on the property, processed, and presented to owners through the application, providing valuable insights and statistics. The application also acts as a communication tool for property owners, enabling announcements and automated emails. Owners can receive maintenance requests from tenants directly through the platform. The goal of this project is to create a user-friendly application that simplifies smart home management for property owners. 


## Team Members
  
| Name | Student ID | Github ID | Email Address|
|------|------------|-----------|--------------|
|**Lauren Rigante**| 40188593| [laurenrigante](https://github.com/laurenrigante)| lrigante@hotmail.com|
|Leo Brodeur|40216409|[leobrod44](https://github.com/leobrod44)| leobrod44@gmail.com|
|Layana Muhdi Al Tounsi| 40125569| [layanat](https://github.com/layanat)| tounsilayana@gmail.com |
|Charles Eimer|26747310|[eimcharles](https://github.com/eimcharles)|c.eimer@me.com|
|Antoine Cantin|40211205|[ChiefsBestPal](https://github.com/ChiefsBestPal)|antoine.cantin@icloud.com|
|Tuan Anh Pham|40213926|[TuanAnh-P](https://github.com/TuanAnh-P)|1tuananhp@gmail.com|
|Matthew Flaherty|40228462|[mattflahertyy](https://github.com/mattflahertyy) | matthewflaherty77@hotmail.com |
|Renaud Senécal|40208309|[SenecalRenaud](https://github.com/SenecalRenaud)|senecalrenaud@gmail.com|
|Ryan Li|40214839|[Ryan2Li](https://github.com/Ryan2Li)|ryanlijune@gmail.com|
|Abdullah Amir|40215286|[AA789-ai](https://github.com/AA789-ai)|sonubhaii883@gmail.com|



## Developer getting started guide
What would a new developer need to do to get the system up and running?

Currently the hub and web system are being developped separately as for scalability benefits. Later in the project, some commands will be set up to launch both systems at the same time.

For Hub: Refer to [Hub developper's guide](https://github.com/leobrod44/Smartess/blob/main/go#readme)

For Web: Refer to [Web developper's guide](https://github.com/leobrod44/Smartess/tree/main/smartessweb#readme)


## Diversity Statement

At Smartess, we believe that diversity drives innovation. We are keen to build an inclusive environment where people from all backgrounds and values feel respected, included, and comfortable in their own homes. We understand that as a company that focuses on enhancing living experiences, our solutions come from diverse perspectives and skills of the team and the communities that we serve. We prioritize inclusivity in our software design and in the development of our platform by creating a user-friendly interface that ensures accessibility for all individuals regardless of their technological background. At Smartess, we work as a team where collaboration thrives across different cultures, backgrounds, and abilities to better understand and cater to the evolving needs of the world around us.
