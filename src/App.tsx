import "./index.css"
import {
  createBrowserRouter,
  RouterProvider,
  useLoaderData,
  useSearchParams,
  useNavigation,
} from "react-router-dom"

type Province = {
  id: number
  name: string
}

type Regency = {
  id: number
  name: string
  province_id: number
}

type District = {
  id: number
  name: string
  regency_id: number
}

type LoaderData = {
  provinces: Province[]
  regencies: Regency[]
  districts: District[]
  selectedProvince?: Province
  selectedRegency?: Regency
  selectedDistrict?: District
}

async function loader({ request }: { request: Request }): Promise<LoaderData> {
  const url = new URL(request.url)

  const provinceId = Number(url.searchParams.get("province_id") || 0)
  const regencyId = Number(url.searchParams.get("regency_id") || 0)
  const districtId = Number(url.searchParams.get("district_id") || 0)

  const [provRes, regRes, distRes] = await Promise.all([
    fetch("/data/provinces.json"),
    fetch("/data/regencies.json"),
    fetch("/data/districts.json"),
  ])

  if (!provRes.ok || !regRes.ok || !distRes.ok) {
    throw new Error("Failed to load data")
  }

  const provinces: Province[] = await provRes.json()
  const regencies: Regency[] = await regRes.json()
  const districts: District[] = await distRes.json()

  const selectedProvince = provinces.find((p) => p.id === provinceId)

  const validRegencies = selectedProvince
    ? regencies.filter((r) => r.province_id === selectedProvince.id)
    : []

  const selectedRegency = validRegencies.find((r) => r.id === regencyId)

  const validDistricts = selectedRegency
    ? districts.filter((d) => d.regency_id === selectedRegency.id)
    : []

  const selectedDistrict = validDistricts.find((d) => d.id === districtId)

  return {
    provinces,
    regencies,
    districts,
    selectedProvince,
    selectedRegency,
    selectedDistrict,
  }
}


function WilayahPage() {
  const {
    provinces,
    regencies,
    districts,
    selectedProvince,
    selectedRegency,
    selectedDistrict,
  } = useLoaderData() as LoaderData

  const navigation = useNavigation()
  const [searchParams, setSearchParams] = useSearchParams()

  const provinceId = Number(searchParams.get("province_id") || 0)
  const regencyId = Number(searchParams.get("regency_id") || 0)
  const districtId = Number(searchParams.get("district_id") || 0)

  const filteredRegencies = regencies.filter(
    (r) => r.province_id === provinceId
  )

  const filteredDistricts = districts.filter(
    (d) => d.regency_id === regencyId
  )

  const updateSearchParams = (params: {
    province_id?: number
    regency_id?: number
    district_id?: number
  }) => {
    const newParams = new URLSearchParams()

    if (params.province_id)
      newParams.set("province_id", String(params.province_id))

    if (params.regency_id)
      newParams.set("regency_id", String(params.regency_id))

    if (params.district_id)
      newParams.set("district_id", String(params.district_id))

    setSearchParams(newParams)
  }

  return (
    <main className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      <aside className="w-full md:w-80 bg-white border-b md:border-r border-slate-200 p-4 md:p-6">
        <div className="flex items-center justify-between md:block">
          <h1 className="text-lg font-semibold text-slate-800 mb-0 md:mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Frontend Assessment
          </h1>
          
          <div className="md:hidden text-xs text-slate-400 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter Wilayah
          </div>
        </div>

        <div className="space-y-4 mt-4 md:mt-0">
          <p className="hidden md:block text-xs font-semibold text-slate-400 mb-4">
            FILTER WILAYAH
          </p>

          {/* Province Select */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500 md:hidden flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Provinsi
            </label>
            <select
              name="province"
              value={provinceId || ""}
              onChange={(e) =>
                updateSearchParams({
                  province_id: Number(e.target.value),
                })
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih Provinsi</option>
              {provinces.map((province) => (
                <option key={province.id} value={province.id}>
                  {province.name}
                </option>
              ))}
            </select>
          </div>

          {/* Regency Select */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500 md:hidden flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Kota/Kabupaten
            </label>
            <select
              name="regency"
              value={regencyId || ""}
              disabled={!provinceId}
              onChange={(e) =>
                updateSearchParams({
                  province_id: provinceId,
                  regency_id: Number(e.target.value),
                })
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm disabled:bg-slate-100 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih Kota/Kabupaten</option>
              {filteredRegencies.map((regency) => (
                <option key={regency.id} value={regency.id}>
                  {regency.name}
                </option>
              ))}
            </select>
          </div>

          {/* District Select */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500 md:hidden flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Kecamatan
            </label>
            <select
              name="district"
              value={districtId || ""}
              disabled={!regencyId}
              onChange={(e) =>
                updateSearchParams({
                  province_id: provinceId,
                  regency_id: regencyId,
                  district_id: Number(e.target.value),
                })
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm disabled:bg-slate-100 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih Kecamatan</option>
              {filteredDistricts.map((district) => (
                <option key={district.id} value={district.id}>
                  {district.name}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Button */}
          <button
            type="button"
            onClick={() => setSearchParams({})}
            className="w-full rounded-xl border border-blue-500 text-blue-600 py-2 text-sm font-medium hover:bg-blue-50 transition flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <section className="flex-1 p-4 md:p-12">
        <div className="max-w-3xl mx-auto">
          <div className="breadcrumb text-sm text-slate-400 mb-12 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span className={selectedProvince ? 'text-blue-600' : ''}>
              {selectedProvince?.name || '-'}
            </span>
            <span>/</span>
            <span className={selectedRegency ? 'text-blue-600' : ''}>
              {selectedRegency?.name || '-'}
            </span>
            <span>/</span>
            <span className={selectedDistrict ? 'text-blue-600' : ''}>
              {selectedDistrict?.name || '-'}
            </span>
          </div>

          {/* Loading State */}
          {navigation.state === "loading" && (
            <div className="text-slate-500 text-center py-12">Loading...</div>
          )}

          {/* Content */}
          {navigation.state !== "loading" && (
            <div className="text-center space-y-6">
              {selectedProvince && (
                <>
                  <div>
                    <span className="inline-flex items-center gap-1 text-xs tracking-widest text-blue-500 font-semibold mb-3">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      PROVINSI
                    </span>
                    <h1 className="text-4xl font-bold mb-8 text-slate-800">
                      {selectedProvince.name}
                    </h1>
                  </div>

                  {selectedRegency && (
                    <div className="border-t border-slate-200 pt-8">
                      <span className="inline-flex items-center gap-1 text-xs tracking-widest text-blue-500 font-semibold mb-3">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        KOTA / KABUPATEN
                      </span>
                      <h2 className="text-3xl font-semibold mb-8 text-slate-700">
                        {selectedRegency.name}
                      </h2>
                    </div>
                  )}

                  {selectedDistrict && (
                    <div className="border-t border-slate-200 pt-8">
                      <span className="inline-flex items-center gap-1 text-xs tracking-widest text-blue-500 font-semibold mb-3">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        KECAMATAN
                      </span>
                      <h3 className="text-2xl font-medium text-slate-600">
                        {selectedDistrict.name}
                      </h3>
                    </div>
                  )}
                </>
              )}

              {/* Empty State */}
              {!selectedProvince && (
                <div className="py-12 text-slate-500">
                  <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <p className="text-lg">Selamat datang</p>
                  <p className="text-sm mt-2">Pilih provinsi untuk memulai</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <WilayahPage />,
    loader,
  },
])

export default function App() {
  return <RouterProvider router={router} />
}