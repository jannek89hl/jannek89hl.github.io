function getKilotonsFromPreset(preset) {
    switch (preset) {
        case 'hand-grenade':
            return 0.0001; // Example value
        case 'c4':
            return 0.0005; // Example value
        case 'dynamite':
            return 0.0003; // Example value
        default:
            return 0;
    }
}
