# VI-Explorer.ts
This is a web-based LabView-VI-File reader. You can open a .vi file from you disk and have a look into it's data or change thinks in it.

<p style="text-align:center" align="center">
<a href="https://vi.hmilch.net/">🎉 run the "VI-Explorer.ts" 🎉</a>
</p>


## How to run
You need to install [Node.js](https://nodejs.org/) to compile and run this *single-page application*. To load all dependencies you need to run the command:

```
npm install
```
After that run the command:

```
npm run serve
```
to compile for development (with hot-reload mode). 

Now you can open http://localhost:8080/ with your browser and play around.


## How to Code
This is a [VUE 3](https://vuejs.org/) app using [TypeScript](https://www.typescriptlang.org/).

From [Visual Studio Code](https://code.visualstudio.com/) you can just press `CTRL-SHIFT-B` to start *serve* and `F5` to open your browser for debugging.

Have a look at the Unit-Tests. They describe how the vi-format is accessed:

```
npm run test:unit
```

To fix the coding-style-guild you can run:
```
npm run lint --fix
```

-----
## Disclaimer
LabView is a registered trademark of [National Instruments](https://www.ni.com) and I'm not affiliated with it. This is just a hobby-project.

