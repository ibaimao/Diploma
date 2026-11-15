import { Box, Heart, Sparkles } from "lucide-react";
import { RoomIllustration } from "./RoomIllustration";

/** Replace the illustration with a lazy-loaded R3F canvas when GLB assets are ready. */
export function PetRoomPlaceholder() {
  return (
    <aside className="pet-room" aria-labelledby="pet-room-title">
      <div className="room-heading">
        <div>
          <span className="eyebrow">ТВОЙ УЮТНЫЙ УГОЛОК</span>
          <h2 id="pet-room-title">Дома всегда хорошо</h2>
        </div>
        <Sparkles size={24} strokeWidth={1.4} aria-hidden="true" />
      </div>
      <div className="room-art">
        <RoomIllustration />
      </div>
      <div className="pet-introduction">
        <span className="pet-heart">
          <Heart size={19} strokeWidth={1.7} />
        </span>
        <div>
          <h3>Знакомься, Плюша</h3>
          <p>Твой будущий компаньон по учёбе</p>
        </div>
        <span className="tiny-sparkle" aria-hidden="true">
          ✦
        </span>
      </div>
      <div className="pet-placeholder-label">
        <Box size={13} /> Иллюстрация-заглушка · 3D появится позже
      </div>
    </aside>
  );
}
