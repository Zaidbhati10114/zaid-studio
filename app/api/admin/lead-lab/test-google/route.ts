import { NextRequest, NextResponse } from "next/server";

const QUERY = "Restaurants in Mumbai";

async function testGoogle() {
  const key = process.env.GOOGLE_PLACES_API_KEY;

  if (!key) {
    return { provider: "google", success: false, error: "Missing API key" };
  }

  const res = await fetch(
    "https://places.googleapis.com/v1/places:searchText",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount",
      },
      body: JSON.stringify({
        textQuery: QUERY,
        maxResultCount: 5,
      }),
    }
  );

  const data = await res.json();

  return {
    provider: "google",
    success: res.ok,
    status: res.status,
    results: data.places ?? [],
    raw: res.ok ? undefined : data,
  };
}

async function testGeoapify() {
  const key = process.env.GEOCODE_API_KEY;

  if (!key) {
    return { provider: "geoapify", success: false, error: "Missing API key" };
  }

  const url =
    "https://api.geoapify.com/v2/places?" +
    new URLSearchParams({
      categories: "catering.restaurant",
      filter: "circle:72.8777,19.0760,5000",
      limit: "5",
      apiKey: key,
    });

  const res = await fetch(url);
  const data = await res.json();

  return {
    provider: "geoapify",
    success: res.ok,
    status: res.status,
    results: data.features ?? [],
    raw: res.ok ? undefined : data,
  };
}

async function testFoursquare() {
  const key = process.env.FOURSQUARE_API_KEY;

  if (!key) {
    return { provider: "foursquare", success: false, error: "Missing API key" };
  }

  const url =
    "https://api.foursquare.com/v3/places/search?" +
    new URLSearchParams({
      query: "restaurant",
      ll: "19.0760,72.8777",
      radius: "5000",
      limit: "5",
    });

  const res = await fetch(url, {
    headers: {
      Authorization: key,
      Accept: "application/json",
    },
  });

  const data = await res.json();

  return {
    provider: "foursquare",
    success: res.ok,
    status: res.status,
    results: data.results ?? [],
    raw: res.ok ? undefined : data,
  };
}

async function testLocationIQ() {
  const key = process.env.LOCATIONIQ_API_KEY;

  if (!key) {
    return { provider: "locationiq", success: false, error: "Missing API key" };
  }

  const url =
    "https://us1.locationiq.com/v1/search?" +
    new URLSearchParams({
      key,
      q: QUERY,
      format: "json",
      limit: "5",
    });

  const res = await fetch(url);
  const data = await res.json();

  return {
    provider: "locationiq",
    success: res.ok,
    status: res.status,
    results: Array.isArray(data) ? data : [],
    raw: res.ok ? undefined : data,
  };
}

export async function GET(request: NextRequest) {
  // const isAuthed =
  //   request.cookies.get("admin_session")?.value === process.env.ADMIN_PASSWORD;

  // if (!isAuthed) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }

  const results = await Promise.all([
    testGoogle(),
    testGeoapify(),
    testFoursquare(),
    testLocationIQ(),
  ]);

  return NextResponse.json({
    query: QUERY,
    providers: results,
  });
}