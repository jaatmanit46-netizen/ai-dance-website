document.getElementById('generateBtn').addEventListener('click', async function() {
    const imageInput = document.getElementById('imageInput');
    const videoPlaceholder = document.getElementById('videoPlaceholder');
    const videoLoading = document.getElementById('videoLoading');
    const outputVideo = document.getElementById('outputVideo');
    const downloadBtn = document.getElementById('downloadBtn');
    const generateBtn = document.getElementById('generateBtn');

    // 1. Check karna ki user ne photo upload ki hai ya nahi
    if (!imageInput.files || imageInput.files.length === 0) {
        alert("Please upload a photo first!");
        return;
    }

    const file = imageInput.files[0];
    const formData = new FormData();
    formData.append('image',...);
    // 2. UI States Change Karna (Loading Shuru)
    videoPlaceholder.classList.add('hidden');
    videoLoading.classList.remove('hidden');
    outputVideo.classList.add('hidden');
    
    // Button ko disable karna taaki user baar-baar click na kare
    generateBtn.disabled = true;
    generateBtn.innerText = "Generating Video...";
    generateBtn.classList.add('opacity-50', 'cursor-not-allowed');

    try {
        // 3. Backend API (`/generate`) ko request bhejna
        const response = await fetch('/generate', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success && data.video_url) {
            // 4. Video milne par use screen par dikhana
            videoLoading.classList.add('hidden');
            outputVideo.classList.remove('hidden');
            outputVideo.src = data.video_url;
            outputVideo.load();
            outputVideo.play();

            // Download button ko enable karna
            downloadBtn.disabled = false;
            downloadBtn.classList.remove('bg-slate-800', 'text-slate-500', 'cursor-not-allowed');
            downloadBtn.classList.add('bg-cyan-600', 'hover:bg-cyan-500', 'text-white');
            
            // Download function set karna
            downloadBtn.onclick = async function() {
    try {
        // Video file ko fetch karna aur blob me convert karna
        const response = await fetch(outputVideo.src);
        const blob = await response.blob();
        
        // Ek temporary hide hua link ('a' tag) banana
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = 'ai-dance-video.mp4'; // Download hone wali file ka naam
        
        // Link par automatic click karwana aur use remove karna
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    } catch (error) {
        // Agar high security blocker ho, to fallback method chalega
        window.open(outputVideo.src, '_blank');
    }
};() {
                window.open(data.video_url, '_blank');
            };
        } else {
            alert("Error: " + (data.error || "Failed to generate video"));
            resetUI();
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Something went wrong while connecting to the server.");
        resetUI();
    }
});

// UI ko wapas normal karne ka function (agar error aaye)
function resetUI() {
    document.getElementById('videoPlaceholder').classList.remove('hidden');
    document.getElementById('videoLoading').classList.add('hidden');
    
    const generateBtn = document.getElementById('generateBtn');
    generateBtn.disabled = false;
    generateBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Generate Dance Video';
    generateBtn.classList.remove('opacity-50', 'cursor-not-allowed');
}
