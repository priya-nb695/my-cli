#!/usr/bin/env node

const fs = require("fs/promises");
const path = require("path");
const { exec } = require ("child_process");
const { promisify } = require("util");

const execAsync = promisify(exec);

async function main(params) {
    try{
       const args = process.argv.slice(2);

       if(args.length === 0){
         console.log("Please provide a project name");
         process.exec(1);
       }

       let projectName = args[0];

       let template = "basic";
       let shouldInstall = true;

       for(let i=1; i< args.length; i++){
            if(args[i] === "--template" && args[i+1]){
                template = args[i+1];
                i++;
            }
            if(args[i] === "--no-install"){
                shouldInstall = true;
            }
       }

       const projectPath = path.join(process.cwd(),projectName);
       const templatePath = path.join(__dirname,"templates",template);
      
       try{
        await fs.access(projectPath);
        console.log("Project already exists");
        process.exit(1);
       }
       catch{

       }

       try{
          await fs.access(templatePath)
       }
       catch{
        console.log(`Template '${template}' does not exist`);
        process.exit(1);
       }

       await fs.cp(templatePath,projectPath,{recursive : true});
       console.log(`Project created using ${template} template`);
       
       const packageJsonPath = path.join(projectPath,"package.json");

       try{
        const packageData = JSON.parse(
            await fs.readFile(packageJsonPath,"utf-8")
        );
        packageData.name=projectName;
        await fs.writeFile(packageJsonPath,JSON.stringify(packageData,null,2))
       }
       catch{

       }

       if(shouldInstall){
        console.log("Installing dependencies");
        await execAsync("npm install",{cwd:projectPath});

       }
       console.log("project setup complete!");


    }
    catch(err){
        console.log("Unexpected error",err.message);
    }
}

main();