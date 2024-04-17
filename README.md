# Ganama-vm: Orchestration Platform for AI Teams and Organizations

Ganama-vm is an orchestration platform designed for AI teams and organizations. Its core concept involves extending real-world organizations with AI agents functioning as employees.

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

1. The VM should be configurable via a REST JSON API. Ochestrations are added and updated via the API.
2. It should allow ochestrations to be run locally while also leaving room for cloud deployment of an ochestration. Similar to how docker works.
3. Use scripting, Angelscript, to allow agents to interface with the host system (e.g access the filesystem). This can also be extended to allow for application services. Angelscript because, for a prototype, it is easy to control the runtime. Scripts are to run in a controlled environment, for security, and this means that every sensitive API they may want to call should be approved by the user.
4. Should be extensible when it comes to LLMs. That is, if the user wants to add support for their custom LLM, they should be able to do so. Can use scripts for this also since all LLMs we know have a REST API.
5. Application services should be allowed to access the outside world, as per user settings, and even setup webhooks when running in the cloud. A Slack application service will need to have a webhook to listen for slack messages. Scripts should be allowed to accept input (e.g API keys) from the user and communicate info back to the user (e.g a webhook url to pass to Slack).
6. A cli should be provided for the creation and updating of ochestrations.
7. Provide a web interface to allow users to update script inputs and view script outputs as well as the messages between agents and the outside world.
8. The interaction between the clients and the ganama vm api should be secure and it should be possible to access the ganama vm api from another machine. We can do this with jwt tokens. Tokens should be granular, access to which ochestrations, which teams, which agents, and what possible actions.
9. VM should startup automatically when sytem restarts (similar to sqlserver on Windows).
10. We should have a script repository where people can share LLM scripts and applictaion services scripts.


## Components of Ganama VM

```txt

        |<-------> Script Repository (Sharing of LLM and application services scripts)
        |
        |
        |
    Ganama CLI ----------------> Local auth service
                    |              ^
                    |     +--------|
                    V     |
Ganama Web -----> Ganama VM ------> Script Engine (LLMs and Application Services) -----> Internet APIs (HTTP, SMTP, IMAP, etc)
                       |                |                           
                       |                |
                       |                |--> System APIs (File system, Audio, Graphics, etc)
                       |
                       +-----> File System to store current configuration, ochestrations, their settings and conversations.
                   
```

\* Local Auth - Ganama VM will use JWT tokens to authorise requests. A discovery environment variable can be set to retrieve
                public keys. The CLI and Ganama Web need to be given jwt tokens to use to authenticate with to the server. These
                tokens can be created via the local auth service which will create the jwt and print it out
                for the user (or write to file). Ganame Web and CLI can access this file to authorise with the server.
                When running locally, this service also acts as the discovery service for jwt tokens used by the CLi and Ganama Web.
                When running in the cloud, this service should not be used (uninstalled for better security). Users should use their
                own, more secure, auth service and set jwt tokens for use by the web and the CLI. Both clients also an optional refresh
                endpoint/token pair so they can automaticlaly refresh the jwt token upon expiration.
