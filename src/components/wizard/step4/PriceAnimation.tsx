import PiggySvg from "@/assets/icons/register-steps/piggy.svg?raw";

export default function PriceAnimation() {
  return (
    <div class="-rotate-[12deg]">
      <div innerHTML={PiggySvg} />
    </div>
  );
}
