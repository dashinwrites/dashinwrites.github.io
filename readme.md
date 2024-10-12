**Before Setup**
1. Ensure your system has NPM installed. This project's version of Yarn and Gulp run well on v12.0.0 if installing with NVM (or the Windows equivalent). If you don't have NPM yet, I recommend installing NVM instead as this allows you to change Node versions as needed with other projects. NVM resources are:
    - OSX: https://github.com/nvm-sh/nvm
    - Windows: https://github.com/coreybutler/nvm-windows 
2. Ensure you have a code editor you are comfortable with and have a way to run CLI commands. All CLI commands will be provided for you below!

**Initial Setup**
1. Fork this repository to your own Github account and clone that fork onto your local system.
2. Change directory into the cloned repository (`cd repositoryname`) and run `yarn install`. After this, you can run `yarn build` to build styles, scripts, and html pages once. Run `yarn watch` to build continuously whenever one of the related files change.
3. Create a new Google Sheet using [this template](https://docs.google.com/spreadsheets/d/1lhUkaFrGjMxKfoGQ008JTgAaWlK2eCEUPTOth0_g4C4/edit?usp=sharing).
4. In Google Sheets, click Extensions > Apps Script. Confirm there is about 202 lines of code there. If not, copy the contents of `googleSheets.txt` from Github into this section.
5. While in Apps Script, click on the `doGet` dropdown. Change this to `setup`. Then, click Run and go through the authentication process. If it claims that 'Google hasn’t verified this app', click through "Advanced > Go to Untitled project (unsafe)" to finish the remaining authentication steps.
6. Click on "Deploy > New Deployment". Ensure "Web App" is selected and that "Who has Access" is set to "Anyone". It will take you through authentication a second time. After, it will provide you a Deployment ID. Copy this and paste it in the `source/js/settings.js` file within the quotations following `const deployID = `.
7. Go back to your Google Sheet. Change the Share settings so that Anyone with the Link is a Viewer. Then, copy the alphanumeric string from the URL. This string will be immediately after `https://docs.google.com/spreadsheets/d/` and ends immediately before `/edit`. This string needs to be assigned to `sheetID` in the same way the deployment ID was assigned to `deployID` in the last step.
9. Ensure all your files are saved. Then, run `yarn build` to build the public versions of these pages. Add all files in your CLI (`git add .`), commit the changes (`git commit -m "commit message"`), and push the changes (`git push`).
10. On Github, go to your repo. Go to Settings. Go to Pages. Set Source to `Deploy from a branch`, and set the branch to `main`. Press `Save`.
11. You can check deployment progress by clicking `Actions`. Once the deployment is done, you can access your tracker from `https://githubusername.github.io/reponame/index.html`. If you would like to leave the repo name out of the URL, ensure the repo your tracker is in is titled `githubusername.github.io`. Then, you can access at `https://githubusername.github.io/index.html`.
12. Then, use the forms in the Admin portion of your tracker to add sites, character tags, characters, writing partners, and threads. The code should handle most of the rest!

**Adding Site Pages**
1. The script will auto-generate the links, but not the new pages. Use the `site.html` pages within the `private/threads/`, `private/characters`, and `private/stats/` folders as a template.
2. Find the instances of `site name from sheet` in all three files and replace with a *fully lowercase* name that exactly matches the site name entered in the Site column of the Sites page from your Google Sheet.
3. Go to `private/stats/statuses.html`. Copy and paste the code that matches this:
`@@include('../../source/templates/status.html', {
    "sitename": "site name from sheet",
    "siteID": "siteidfromsheet"
})`
And replace `site name from sheet` as in Step 2 and then `siteidfromsheet` with the matching value from the ID column of the Sites page of your Google Sheet.
4. Run `yarn build` to build the public versions of these pages. Add all files in your CLI (`git add .`), commit the changes (`git commit -m "commit message"`), and push the changes (`git push`).

**Change Thread Tags**
1. If you have different thread tags in mind, go to `source/js/settings.js`. Find `const threadTags`. Any string assigned inside this array will be added to the forms so that you can add those tags to your threads.
2. Don't forget to `yarn build` and push your changes to Github to see them live!

**Change Chart Colors**
1. If you have different chart colors in mind, go to `source/js/settings.js`. Find `const chartColors`. Add colors you want inside strings within this array, and remove colors you don't want. The charts will use them in order every time, so put your preferred colors at the start of the array!
2. Don't forget to `yarn build` and push your changes to Github to see them live!# thread-tracker
# thread-tracker
# thread-tracker
# thread-tracker
