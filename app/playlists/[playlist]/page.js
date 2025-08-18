import React from 'react'

const page = ({ params }) => {
  const { playlist } = params;
  return (
    <div>
      <h1>Playlist {playlist}</h1>
    </div>
  )
}

export default page
