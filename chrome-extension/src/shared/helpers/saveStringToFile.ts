export function saveStringToFile(filename: string, content: string): void {
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
