export interface SearchProviderConfig {
    id: "google" | "geoapify" | "locationiq" | "foursquare";

    name: string;

    monthlyFreeRequests: number;

    color: string;

    enabled: boolean;

    supports: {
        ratings: boolean;
        website: boolean;
        phone: boolean;
        openingHours: boolean;
    };
}

export const SEARCH_PROVIDERS: Record<
    SearchProviderConfig["id"],
    SearchProviderConfig
> = {
    google: {
        id: "google",
        name: "Google Places",

        monthlyFreeRequests: 35000,

        color: "blue",

        enabled: true,

        supports: {
            ratings: true,
            website: true,
            phone: true,
            openingHours: true,
        },
    },

    geoapify: {
        id: "geoapify",
        name: "Geoapify",

        monthlyFreeRequests: 3000,

        color: "green",

        enabled: true,

        supports: {
            ratings: false,
            website: true,
            phone: true,
            openingHours: true,
        },
    },

    locationiq: {
        id: "locationiq",
        name: "LocationIQ",

        monthlyFreeRequests: 5000,

        color: "purple",

        enabled: true,

        supports: {
            ratings: false,
            website: false,
            phone: false,
            openingHours: false,
        },
    },

    foursquare: {
        id: "foursquare",
        name: "Foursquare",

        monthlyFreeRequests: 5000,

        color: "orange",

        enabled: false,

        supports: {
            ratings: false,
            website: true,
            phone: true,
            openingHours: true,
        },
    },
};

export function getProviderConfig(
    provider: SearchProviderConfig["id"],
) {
    return SEARCH_PROVIDERS[provider];
}