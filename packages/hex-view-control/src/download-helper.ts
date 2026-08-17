export class DownloadHelper {
    public static downloadBytes(data: Uint8Array, fileName: string): void {
        // Create a Blob from the byte array
        const blob = new Blob([data as BlobPart], { type: "application/octet-stream" });

        // Create a temporary object URL
        const url = URL.createObjectURL(blob);

        // Create a temporary <a> element
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.style.display = "none"; // keep it invisible

        // Append the link to the DOM so it can be clicked
        document.body.appendChild(a);

        // Trigger the download dialog
        a.click();

        // Remove the temporary element from the DOM
        document.body.removeChild(a);

        // Revoke the temporary URL to free memory
        URL.revokeObjectURL(url);
    }

}