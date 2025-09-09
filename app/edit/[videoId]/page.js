import React from 'react'

const EditVideoDetails = ({params}) => {
    const {videoId} = React.use(params);
    
  return (
    <div>
      this is the videoId {videoId}
    </div>
  )
}

export default EditVideoDetails
