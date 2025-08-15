"use client";

import React, { Suspense } from "react";
import SearchContent from "@/components/SearchContent";

const Page = ({searchParams}) => {

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchContent searchParams={searchParams} />
    </Suspense>
  );
};

export default Page;
