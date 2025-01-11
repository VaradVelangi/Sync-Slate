import Designer from "@/assets/Designer.jpeg"
import FormComponent from "@/components/forms/FormComponent"
import { motion } from "framer-motion"

function HomePage() {
    return (
        <div className="relative min-h-screen bg-black p-6">
            {/* Background Animation */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-yellow-300 to-orange-500 opacity-100"></div>
            <div className="container mx-auto max-w-6xl relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="grid grid-cols-1 items-center gap-12 md:grid-cols-2"
                >

                    <motion.div
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="rounded-2xl bg-gray-50 p-8 shadow-2xl transform hover:scale-105 transition-all duration-300"
                    >
                        <div className="mb-6 text-center">
                            <h1 className="mb-4 text-4xl font-bold text-black text-shadow-md">
                                SyncSlate
                            </h1>
                            <p className="mb-6 text-black text-lg">
                                A Shared Space for Limitless Creativity.
                            </p>
                        </div>
                        <FormComponent />
                    </motion.div>
                    <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="flex justify-center"
                    >
                        <img
                            src={Designer}
                            alt="Designer Illustration"
                            className="w-full max-w-[400px] rounded-2xl border-2 border-gray-300 transition-transform duration-300 ease-in-out hover:scale-105 shadow-xl"
                        />
                    </motion.div>

                    
                </motion.div>
            </div>
        </div>
    )
}

export default HomePage;
