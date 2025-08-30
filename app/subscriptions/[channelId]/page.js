import React from 'react'

const Channel = ({params}) => {
  const {channelId} = React.use(params);

  return (
    <div>
      <h1>Subscriptions</h1>
      <p>Manage your subscriptions here for channel: {channelId}</p>
    </div>
  )
}

export default Channel
