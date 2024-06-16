# Ganama-vm: Orchestration Platform for AI Teams and Organizations

Ganama-vm is an orchestration platform designed for AI teams and organizations. Its core concept involves extending real-world organizations with AI agents functioning as employees.

## Tracking Progress

Track project progress from Notion -> [Ganama VM](https://www.notion.so/Ganame-VM-fa29d2df82864938abf61c941e543819?pvs=4).

## Motivation

In computer science, we often encounter divide and conquer algorithms, which operate on the principle that any complex problem can be broken down into smaller, more manageable sub-problems organized in a tree structure. Each node in this tree represents a problem less complex than its parent node. This aligns well with the context window limitation of Large Language Models (LLMs). By orchestrating a tree of AI agents, each equipped with sufficient context and information, we can tackle large problems effectively. Each AI node can focus on solving a specific subset of the overall problem. Moreover, a node can consist of smaller nodes, each addressing a particular aspect of the problem. For instance, while programming four years of undergraduate accounting in a single prompt may seem impossible, with the right tree structure, we can develop virtual accountants, bookkeepers, financial directors, and even CEOs. This project aims to achieve precisely that: orchestrations capable of delivering value to real-world organizations while adhering to organizational policies.

## Definitions

1. **Composer**: An individual responsible for creating orchestrations.
2. **Orchestration**: A hierarchical structure comprising AI teams, AI agents, application services, LLMs, and settings, facilitating the collaboration of AI agents to solve complex problems. Orchestration enables the implementation of [Agent Swarms](https://github.com/daveshap/OpenAI_Agent_Swarm).
3. **AI Team**: A collection of AI agents focused on solving a specific subset of the problem.
4. **AI Agent**: A team member tasked with performing its designated function. Agents can be single-layered or multilayered. In multilayered agents, inter-layer communication occurs via north and south bound buses. Application services are accessible only to the lowest layer.
5. **Application Services**: Using LLM function calls, agents can access various applications such as Github, Gmail, Zoho, Slack, Discord, etc. The Ganama VM API itself can serve as an application service, enabling teams to modify themselves.
6. **Settings**: Orchestration settings or environment variables store global context, such as organizational website URLs and privacy policy statements.
7. **North and South Bound Buses**: Inspired by the [ACE Framework](https://github.com/daveshap/ACE_Framework), these buses facilitate communication within multilayered agents. The southbound bus allows a layer to send messages to the layer below, while the northbound bus enables communication to the layer above. Inter-layer communication is restricted to adjacent layers.
8. **Messages**: Agents and layers communicate via messages. Messages are categorized by topics or subjects, facilitating contextual restoration. Topics define the conversation or context and should be unique to each distinct context. Inter-agent messages may also be broadcasted to multiple agents. External parties, such as human employees, can communicate with orchestrations through the messaging system.
9. **Conversation**: A sequence of messages associated with a specific topic exchanged between agents or agent layers.

## Some Goals, roughly

1. I should be able to start, and stop orchestrations and be able to set the to run on system boot (auto start).
2. Prioritize cloud deployments. That is, orchestrations running on Google cloud, AWS, etc.
3. Should be extensible when it comes to LLMs. That is, if the user wants to add support for their custom LLM, they should be able to do so.
4. Application services should be allowed to access the outside world and even setup webhooks when running in the cloud. A Slack application service will need to have a webhook to listen for slack messages. Services should be allowed to accept input (e.g API keys) from the user and communicate info back to the user (e.g a webhook url to pass to Slack).
5. A cli should be provided for the creation and updating of orchestrations.
6. Provide a web interface to allow users to update script inputs and view script outputs as well as the messages between agents and the outside world.
7.  Should allow prompting in markdown and use YAML front matter to allow specifying, for example, the LLM to be used for the inference of the layer. An orchestration is made up of folders where each folder is a team of agents. Inside the folder for a team there will be more folders where each folder is an agent. In these agent folders are layer files in markdown. The files are are sorted in lexicographical order of their names and the resulting list is the order of the layers. That is, the first file is first layer, the 2nd being the second layer, etc. Application services should be specified in the last layer of an agent.


## Components of Ganama VM

```txt

       Ganama CLI (Dart) - Gets settings and creates DockerCompose and Docker File.
               ^
               | 
               |     
Settings Page -+     Ganama VM (NodeJS Typescript) - as Docker Image
                        |     |
                        |     +------> LLM and Application Services - as Docker Images
                        |                |(Services are to be stateless. LLM services belong to the orchestration, and app services belong to an agent.)
                        |                |(Services can register sub services. E.g Ollama is a service with Ollama/mistral being sub service) 
                        |                |(Event better, Ollama can be called the application and mistral is an LLm service exposed by this app)
                        |                |
                        |                |
                        |                |-> Volumes to persist information(e.g mailboxes, etc)
                        |
                        +-----> Volumes to persist current configuration, app settings conversations, and logs.



Use volumes to persist data so that orchestrations can continue work after a restart.
The only API The VM exposes for now, is the webhooks API (Since there is no Auth flow yet). 
```

## Milestones

- [ ] I can create an orchestration with at least 2 teams that takes in no inputs, has no layers and conversations and I can (using postman) hit a webhook on a running service that messages a given agent.
- [ ] My services can accept configuration via web interface (text, text dropdown, toggle, and radio group) and display whatever values they may want to display (text only for now).
- [ ] My agents can send and receive emails (with attachments) via Gmail. Conversations are maintained and the agents can be multilayered.
- [ ] My agents can set reminders and be notified when it's time for those reminders to be executed. They should also be able to save files in the file system for their own records (e.g if agent needs to keep folders for the customers it interacts with). There should also be a shared file system that can be pre-populated with files (i.e upon uploading of orchestration). The orchestrator can specify which agents or teams have access to which files and folders in the shared file system. This is how we will allow agents to be aware of company policies, for example.
- [ ] Create an orchestration that runs an actual business with actual customers but run entirely by agents. This is just to have a benchmark.

## Application API

1. /services returns the services provided by this application. Each service has a type which can be llm or application service. If application service, then the service API should be under /services/{service_id}/api. If llm then /llms/{llm_id} is the API of the LLM in question.
2. LLMs provide a predefined API. with POST /message used to post messages to the LLM. The body also includes the services the given agent layer has access to. The service objects will have have endpoint to the API for the service which is to be used as the request prefix. As well as the functions that service provides. A function has a name, the endpoint path, the parameters it takes, as well as the HTTP method it should be called by. Each parameter has a name, the type (integer, real number or string) as well as a description of the parameter.
3. Application services on the other hand provide their own API. The API is just a flat array of functions whose schema is as defined above.
4. Application webhooks are available at /webhooks/${app_id}/{web_hook_name}. The reason to place them on the application is so that it is up to the application to route the webhook event to the correct service. Or even multiple services.
5. First layer is 0, second layer is 1, third layer is 2, and so on.
6. The id for an agent is teamName.agentName
7. Messaging a layer specify a layer id for the agent: teamName.agentName-0