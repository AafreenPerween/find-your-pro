async function translateText(text, targetLang) {
    const apiKey = "YOUR_GOOGLE_TRANSLATE_API_KEY"; // Replace with actual key
    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: "POST",
            body: JSON.stringify({ q: text, target: targetLang }),
            headers: { "Content-Type": "application/json" }
        });

        const data = await response.json();
        return data.data.translations[0]?.translatedText || text;
    } catch (error) {
        console.error("Translation failed:", error);
        return text;
    }
}

// Function to apply translations
async function applyTranslations(language) {
    const elementsToTranslate = [
        { id: "pageTitle", text: "Settings | Find You Pro" },
        { id: "brandName", text: "Find You Pro" },
        { id: "dashboardTitle", text: "Dashboard" },
        { id: "manageProviders", text: "Manage Providers" },
        { id: "manageCustomers", text: "Manage Customers" },
        { id: "serviceRequests", text: "Service Requests" },
        { id: "settingsTitle", text: "Settings" },
        { id: "settingsHeader", text: "Settings" },
        { id: "preferencesTitle", text: "System Preferences" },
        { id: "themeLabel", text: "Theme Mode" },
        { id: "notificationLabel", text: "Enable Notifications" },
        { id: "languageLabel", text: "Preferred Language" },
        { id: "saveBtn", text: "Save Settings" },
        { id: "footerText", text: "All rights reserved." }
    ];

    elementsToTranslate.forEach(async (item) => {
        const translatedText = await translateText(item.text, language);
        const element = document.getElementById(item.id);
        if (element) {
            element.innerHTML = translatedText;
        }
    });
}

// Load saved language on page load
document.addEventListener("DOMContentLoaded", async function () {
    const savedLang = localStorage.getItem("selectedLang") || "en";
    document.getElementById("languageSwitcher").value = savedLang;
    await applyTranslations(savedLang);
});

// Detect language change & apply translation globally
document.getElementById("languageSwitcher").addEventListener("change", async function () {
    const selectedLang = this.value;
    localStorage.setItem("selectedLang", selectedLang);
    await applyTranslations(selectedLang);
});