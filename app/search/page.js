"use client";

import React, { useState, useEffect, Suspense } from "react";
import SearchContent from "@/components/searchContent";

const Page = () => {

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
};

export default Page;
