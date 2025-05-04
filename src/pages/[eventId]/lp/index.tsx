import useFetchSections from "@/hooks/useFetchSections";
import LandingPagePreview from "@/molecules/LandingPagePreview";
import { useAuthStore } from "@/store/useAuthStore";
import { ISection } from "./manage";
import { useEffect, useState } from "react";
import SEO from "@/molecules/SEO";

const LandingPage = () => {
  const [dataSource, setDataSource] = useState<ISection[]>([]);
   const { event } = useAuthStore();
  
    const { isLoading, listAllSections } = useFetchSections();
  
    async function fetchSections() {
      const data = await listAllSections();
      console.log("data", data);
      setDataSource(data as ISection[]);
    }
  
    useEffect(() => {
      if (event?.id) {
        fetchSections();
      }
    }, [event]);
  return ( 
    <>
    <SEO title={event?.name as string} />
    <LandingPagePreview data={dataSource} isLoading={isLoading}/>
    </>
   );
}
 
export default LandingPage;