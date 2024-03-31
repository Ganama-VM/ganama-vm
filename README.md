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
