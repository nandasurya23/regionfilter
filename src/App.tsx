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
    <main className="min-h-screen bg-slate-100 flex">
      <aside className="w-72 bg-white border-r border-slate-200 p-6">
        <h1 className="text-lg font-semibold mb-6 text-slate-800">
          Frontend Assessment
        </h1>

        <p className="text-xs font-semibold text-slate-400 mb-4">
          FILTER WILAYAH
        </p>

        <div className="space-y-4">
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

          <button
            type="button"
            onClick={() => setSearchParams({})}
            className="w-full rounded-xl border border-blue-500 text-blue-600 py-2 text-sm font-medium hover:bg-blue-50 transition"
          >
            Reset
          </button>
        </div>
      </aside>

      <section className="flex-1 p-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="breadcrumb text-sm text-slate-400 mb-12">
            {selectedProvince?.name || "-"} /{" "}
            {selectedRegency?.name || "-"} /{" "}
            {selectedDistrict?.name || "-"}
          </div>

          {navigation.state === "loading" && (
            <div className="text-slate-500">Loading...</div>
          )}

          {selectedProvince && (
            <>
              <p className="text-xs tracking-widest text-blue-500 font-semibold">
                PROVINSI
              </p>
              <h1 className="text-4xl font-bold mb-8">
                {selectedProvince.name}
              </h1>
            </>
          )}

          {selectedRegency && (
            <>
              <p className="text-xs tracking-widest text-blue-500 font-semibold">
                KOTA / KABUPATEN
              </p>
              <h2 className="text-3xl font-semibold mb-8">
                {selectedRegency.name}
              </h2>
            </>
          )}

          {selectedDistrict && (
            <>
              <p className="text-xs tracking-widest text-blue-500 font-semibold">
                KECAMATAN
              </p>
              <h3 className="text-2xl font-medium">
                {selectedDistrict.name}
              </h3>
            </>
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