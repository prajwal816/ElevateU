import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Flower2, Sparkles, Sticker } from "lucide-react";

const Newsletter = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="relative bg-secondary rounded-3xl p-12 md:p-16 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-8 left-8 w-16 h-16 bg-white rounded-2xl flex items-center justify-center rotate-12 shadow-lg">
            <Flower2 className="w-8 h-8 text-secondary" />
          </div>
          <div className="absolute top-8 right-8 w-16 h-16 bg-white rounded-2xl flex items-center justify-center -rotate-12 shadow-lg">
            <Sparkles className="w-8 h-8 text-secondary" />
          </div>
          <div className="absolute bottom-8 right-1/4 w-12 h-12 bg-white rounded-xl flex items-center justify-center rotate-6 shadow-lg">
            <Sticker className="w-6 h-6 text-secondary" />
          </div>
          
          {/* Large decorative circles */}
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-400/30 rounded-full -translate-x-1/2 translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-yellow-400/30 rounded-full translate-x-1/2 translate-y-1/2" />
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-yellow-400/20 rounded-full" />
          
          <div className="relative z-10 max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              Subscribe to our Newsletter for Newest Course Updates
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-white border-0 h-12 px-6 text-base shadow-lg"
              />
              <Button size="lg" className="bg-gray-900 hover:bg-gray-800 text-white px-8 shadow-lg">
                Subscribe!
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
