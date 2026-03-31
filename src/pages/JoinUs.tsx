import { Instagram, Youtube, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const links = [
  { label: "Follow on Instagram", href: "https://instagram.com/vegan.psyop", icon: Instagram },
  { label: "Watch on YouTube", href: "https://youtube.com", icon: Youtube },
];

const JoinUs = () => (
  <div className="mesh-gradient min-h-[calc(100vh-4rem)]">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="container flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-16"
    >
      <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground text-center md:text-4xl md:leading-snug mb-3">Join Us</h1>
      <p className="text-muted-foreground text-lg mb-10 text-center max-w-md">
        Connect with the community. Share findings. Demand transparency.
      </p>

      <div className="flex flex-col gap-4 w-full max-w-sm">
        {links.map((link, i) => (
          <motion.div
            key={link.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 + i * 0.1 }}
            whileHover={{ scale: 1.01 }}
          >
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full h-14 justify-start gap-3 rounded-2xl border-border/60 bg-card/80 text-base font-semibold shadow-card transition-shadow hover:border-border hover:shadow-card-hover"
            >
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
              >
                <link.icon size={20} strokeWidth={1.5} />
                {link.label}
              </a>
            </Button>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.4 }}
          whileHover={{ scale: 1.01 }}
        >
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full h-14 justify-start gap-3 rounded-2xl mt-2 border-border/60 bg-card/80 text-base font-semibold shadow-card transition-shadow hover:border-border hover:shadow-card-hover"
          >
            <a href="mailto:info.isthisvegan@gmail.com" aria-label="Contact us via email">
              <Mail size={20} strokeWidth={1.5} />
              Contact Us
            </a>
          </Button>
        </motion.div>
      </div>
    </motion.div>
  </div>
);

export default JoinUs;
