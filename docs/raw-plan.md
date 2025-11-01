Here's the goal.

I want to create bun ts script which will do following:
we want to change the alias and path of claude-code.
This is basically a way have multiple claude code instance with different alias and thier respective configuration.
For example both glm and minimax supports claude code on thier API.
Let's say if you want to have claude code subscription but also want to use glm or minimax it gets difficult to change configs.
SO though it would be better to have multiple claude code instances with different alias and config paths.

Goal and approach:
It would be anti pattern to maintain forks so here what I thought.
We will create a bun ts script which will change the alias and path of claude-code in the config file.
and then we will publish it as our npm package.
This way we will also able to maintain latest version.

approach to maintain latest version:
We will check npm registry for latest version every 3 hours.
if a new versoin is found we will fetch the claude-code repo run our bun ts script to change the alias and path and then publish it as our npm package.
