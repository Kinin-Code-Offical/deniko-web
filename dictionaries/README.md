# 🌍 Internationalization (i18n) Dictionaries

This directory contains the JSON files used for translating the application.

## 📂 Files

- **`en.json`**: English translations (Default).
- **`tr.json`**: Turkish translations.

## 📖 Usage

We use a server-side dictionary pattern.

1. The requested locale is determined in middleware or the route params (`[lang]`).
2. `lib/get-dictionary.ts` loads the corresponding JSON file.
3. The dictionary object is passed down to components as a prop.

## 📝 Structure

The JSON structure should be nested by feature or page to keep it organized.

```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel"
  },
  "dashboard": {
    "title": "Dashboard",
    "welcome": "Welcome back, {name}"
  }
}
```

## ➕ Adding New Translations

1. Add the key and value to **both** `en.json` and `tr.json`.
2. Ensure the structure matches exactly in both files to avoid runtime errors.

## TODO

- Document how to add new locales (folder naming, middleware updates, dictionary imports).
- Add a CI/lint script that ensures `en.json` and `tr.json` stay in sync.
- Move large static copy (FAQs, landing copy) into dictionaries instead of hardcoding them in components.
