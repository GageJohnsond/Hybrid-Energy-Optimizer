import { CitySearch } from "@/components/city-search"
import { Hero } from "@/components/hero"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Hero />
      <CitySearch />
    </main>
  )
}
