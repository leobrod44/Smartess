import React from "react";
import Image from "next/image";
import noresultsimg from "../../public/images/freepik__background__98091.png";
export interface NoResults {
  searchItem: string;
}
const NoResultsFound= ({ searchItem }: NoResults) => {

    return(
        <>
        <div className="w-full flex flex-col items-center justify-center gap-2">
            <Image src={noresultsimg} alt="No results found" width={240} height={200} />
           <h2 className=" text-2xl text-[#325a67]"> We&apos;re Sorry...</h2>
           <h3> We couldn&apos;t find any matches for <span className="text-[#325a67]">&quot;{searchItem}&quot;</span></h3>
           <h5>Double check your search for any typos, or please try a different search term</h5>
          
        </div>
        </>
    );
}

export default NoResultsFound;