interface GoogleSearchOptions {
    city: string;
    niche: string;
    maxResults?: number;
}

export interface BusinessDirectoryRecord {
    placeId: string;
    name: string;
    address: string;
    city: string;
    latitude: number;
    longitude: number;

    rating: number | null;
    reviewCount: number | null;

    website: string | null;
    phone: string | null;

    primaryType: string | null;
    types: string[];

    openingHours: string[];
}

const FIELD_MASK = [
    "places.id",
    "places.displayName",
    "places.formattedAddress",
    "places.location",
    "places.rating",
    "places.userRatingCount",
    "places.websiteUri",
    "places.nationalPhoneNumber",
    "places.types",
    "places.regularOpeningHours.weekdayDescriptions",
].join(",");

function getPrimaryType(types: string[] = []) {
    const priority = [
        "restaurant",
        "cafe",
        "lodging",
        "beauty_salon",
        "gym",
        "bakery",
        "store",
    ];

    return priority.find((type) => types.includes(type)) ?? types[0] ?? null;
}

function normalizePlace(place: any, city: string): BusinessDirectoryRecord {
    return {
        placeId: place.id,
        name: place.displayName?.text ?? "Unknown",
        address: place.formattedAddress ?? "",
        city,

        latitude: place.location?.latitude ?? 0,
        longitude: place.location?.longitude ?? 0,

        rating: place.rating ?? null,
        reviewCount: place.userRatingCount ?? null,

        website: place.websiteUri ?? null,
        phone: place.nationalPhoneNumber ?? null,

        primaryType: getPrimaryType(place.types),
        types: place.types ?? [],

        openingHours:
            place.regularOpeningHours?.weekdayDescriptions ?? [],
    };
}

export async function searchGooglePlaces({
    city,
    niche,
    maxResults = 20,
}: GoogleSearchOptions): Promise<BusinessDirectoryRecord[]> {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
        throw new Error("GOOGLE_PLACES_API_KEY is missing.");
    }

    const response = await fetch(
        "https://places.googleapis.com/v1/places:searchText",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": apiKey,
                "X-Goog-FieldMask": FIELD_MASK,
            },
            body: JSON.stringify({
                textQuery: `${niche} in ${city}`,
                pageSize: Math.min(maxResults, 20),
            }),
            cache: "no-store",
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data?.error?.message ?? "Google Places request failed."
        );
    }

    return (data.places ?? []).map((place: any) =>
        normalizePlace(place, city)
    );
}