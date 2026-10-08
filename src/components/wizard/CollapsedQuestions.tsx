import CollapsedQuestion from "./CollapsedQuestion";
import BoxDiscSVG from "@/assets/icons/register-steps/box-disc.svg";

export default function CollapsedQuestions() {
  return (
    <section>
      <CollapsedQuestion
        step={1}
        icon={<img src={BoxDiscSVG} alt="Box Disc" />}
        question="¿Cuál es el nombre del artículo?"
        answer="Disco Vinilo & pulgadas - Olivia Ordringer - Edicion Magenta RecordsDisco Vinilo - You seem so sad for a girl so in love “Static Lover”- Olivia Rodrigo, 2026"
      />
    </section>
  );
}
