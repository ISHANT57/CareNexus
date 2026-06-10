import * as React from "react"
import { Search } from "lucide-react"
import { useLocation } from "wouter"
import { 
  CommandDialog, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList 
} from "@/components/ui/command"
import { useListPatients, useListClinics, useListUsers } from "@workspace/api-client-react"

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false)
  const [, setLocation] = useLocation()
  
  // Fetch some preliminary data for search
  // In a real huge app, we would use a dedicated search endpoint with debouncing,
  // but for now we'll fuzzy search over the first page of recent data.
  const { data: patientsData } = useListPatients({ limit: 50 } as any)
  const { data: clinicsData } = useListClinics({ limit: 50 } as any)
  const { data: usersData } = useListUsers({ limit: 50 } as any)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground px-4 py-2 relative h-9 w-full justify-start rounded-[0.5rem] text-sm text-muted-foreground sm:pr-12 md:w-64 lg:w-80"
      >
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <span className="hidden lg:inline-flex">Search patients, clinics...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          <CommandGroup heading="Patients">
            {patientsData?.data?.map((patient: any) => (
              <CommandItem
                key={patient.id}
                value={`${patient.firstName} ${patient.lastName} ${patient.nhsNumber}`}
                onSelect={() => runCommand(() => setLocation(`/patients/${patient.id}`))}
              >
                {patient.firstName} {patient.lastName}
                <span className="ml-2 text-xs text-muted-foreground">NHS: {patient.nhsNumber}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandGroup heading="Clinics">
            {clinicsData?.data?.map((clinic: any) => (
              <CommandItem
                key={clinic.id}
                value={clinic.name}
                onSelect={() => runCommand(() => setLocation(`/clinics`))}
              >
                {clinic.name}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandGroup heading="Team Members">
            {usersData?.data?.map((user: any) => (
              <CommandItem
                key={user.id}
                value={`${user.firstName} ${user.lastName} ${user.email}`}
                onSelect={() => runCommand(() => setLocation(`/users/${user.id}`))}
              >
                {user.firstName} {user.lastName}
                <span className="ml-2 text-xs text-muted-foreground">{user.email}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
