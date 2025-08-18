import React from 'react'

const forgotPassword = () => {
  return (
    <div>
      <h1>Forgot Password Available Soon. </h1>
      <form>
        <label htmlFor="email">Email:</label>
        <input type="email" id="email" name="email" required />
        <button type="submit">Reset Password</button>
      </form>
    </div>
  )
}

export default forgotPassword
