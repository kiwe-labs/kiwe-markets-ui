import React from 'react'
import { Modal } from 'antd'

const ZalinaModal: any = React.forwardRef<any, any>((props, ref) => {
    const {
        isOpen,
        onClose,
        children,
        title,
    } = props

    return (
        <Modal title={title} visible={isOpen} onCancel={onClose} width={1000} closable={false}>
            {children}
        </Modal>
    )
})

const Header = ({ children }) => {
    return <div className={`flex flex-col items-center pb-2`}>{children}</div>
}

ZalinaModal.Header = Header

export default ZalinaModal
