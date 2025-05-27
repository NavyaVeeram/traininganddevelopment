import React from 'react'
import EmailApproval from './EmailApproval'
import EmailRecjection from './EmailRejection'
const EmailApprovalMain = () => {
  return (
    <div className='flex gap-x-2' style={{marginLeft:"5px"}}>
      <EmailApproval/>
      <EmailRecjection/>
    </div>
  )
}

export default EmailApprovalMain
