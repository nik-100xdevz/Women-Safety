import { toast } from 'react-toastify';

export const useToast = () => {
  return {
    success: (message) => toast.success(message),
    error: (message) => toast.error(message),
    info: (message) => toast.info(message),
    warning: (message) => toast.warning(message),
    default: (message) => toast(message),
    // Add more customized toast types as needed
    custom: (options) => toast(options.message, { ...options }),
  };
};

export default useToast; 