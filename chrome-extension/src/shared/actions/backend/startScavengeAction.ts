import {BackendActionContext} from "@src/shared/actions/backend/core/BackendActionContext";
import {buildGameUrlWithScreen} from "@src/shared/helpers/buildUrl";
import {PageParser} from "@src/shared/helpers/PageParser";

interface StartScavengeActionInput{
  villageId: string
}

export default async function startScavengeAction(context: BackendActionContext, input: StartScavengeActionInput ) {
  const pageStatus = await context.messenger.executePageStatusAction({});
  // check if is in game verify if url from pageStatus is equals value from pageStatus.details?.url

  const url = buildGameUrlWithScreen(context.playerSettings.server,{
    village: input.villageId, //TODO
    screen : "place",
    mode: "scavenge",
  }, {})

  const scavengingPage = await context.messenger.executeNavigateToPageAction({ url, reload: true})

  const pageContent = await context.messenger.executePageStatusAction({})


  const pageParser = new PageParser(pageContent.details?.pageContent ?? "");

  //console.log(pageContent.details?.pageContent ?? "");
  //console.log(pageParser.getContent());

  const mainContent = pageParser.queryMainContent()
  const scavengePanel = pageParser.createChildParserByDivClass("scavenge-screen-main-widget")
  const optionsContainer = pageParser.query("options-container")
  const count = optionsContainer.item(0).childElementCount;
  console.log(`count ${count}`)



  await saveStringToFile("test.data",mainContent.getContent());
  //TODO go to overview and extract all vilalges

  //TODO extract playerId if not extracted yet
}

function saveStringToFile(filename: string, content: string): void {
  // Encode the string as a data URL (base64 encoding)
  const dataUrl = `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`;

  // Use the chrome.downloads API to save the file
  chrome.downloads.download(
    {
      url: dataUrl, // Use the data URL directly
      filename, // Set the file name (e.g., "example.txt")
      saveAs: true, // Prompt the user to choose a save location
    },
    (downloadId) => {
      if (chrome.runtime.lastError) {
        console.error('Error downloading file:', chrome.runtime.lastError.message);
      } else {
        console.log('File downloaded with ID:', downloadId);
      }
    }
  );
}
