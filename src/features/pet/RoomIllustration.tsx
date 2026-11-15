import { useId } from "react";

/** Original SVG placeholder inspired by the supplied room references; no WebGL or 3D yet. */
export function RoomIllustration() {
  const id = useId().replaceAll(":", "");
  return (
    <svg
      viewBox="0 0 520 620"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Рыже-белый котёнок Плюша в красном берете и зелёном шарфе. Уютная комната с окном, растениями, книгами и голубой миской."
    >
      <defs>
        <linearGradient
          id={`${id}-wall`}
          x1="50"
          y1="0"
          x2="500"
          y2="520"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F6DFC3" />
          <stop offset="1" stopColor="#F1CCA7" />
        </linearGradient>
        <linearGradient
          id={`${id}-floor`}
          x1="260"
          y1="405"
          x2="260"
          y2="620"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E4BC91" />
          <stop offset="1" stopColor="#F0CDA8" />
        </linearGradient>
        <linearGradient
          id={`${id}-sky`}
          x1="375"
          y1="100"
          x2="440"
          y2="325"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#A9D0E5" />
          <stop offset="1" stopColor="#DBE8E2" />
        </linearGradient>
        <linearGradient
          id={`${id}-fur`}
          x1="160"
          y1="310"
          x2="300"
          y2="500"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFF4D9" />
          <stop offset="1" stopColor="#F2E4C0" />
        </linearGradient>
        <linearGradient
          id={`${id}-bowl`}
          x1="375"
          y1="515"
          x2="385"
          y2="573"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#A7C5E2" />
          <stop offset="1" stopColor="#83ACCF" />
        </linearGradient>
        <radialGradient
          id={`${id}-light`}
          cx="0"
          cy="0"
          r="1"
          gradientTransform="translate(365 310) rotate(140) scale(330 190)"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFF7DA" stopOpacity=".6" />
          <stop offset="1" stopColor="#FFF7DA" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path fill={`url(#${id}-wall)`} d="M0 0h520v620H0z" />
      <path d="M0 416c165-22 331-15 520 6v198H0Z" fill={`url(#${id}-floor)`} />
      <path d="M0 416c155-17 337-15 520 6" stroke="#D0A076" strokeWidth="9" />
      <path d="m344 269 132 47 44 203-291-2Z" fill={`url(#${id}-light)`} />
      <path
        d="M36 509c40-9 82-11 111-10m285 85c30-3 58-2 88 2M17 570h53"
        stroke="#D7AD84"
        strokeWidth="3"
        strokeLinecap="round"
        opacity=".5"
      />
      {/* Arched wooden window. */}
      <path d="M330 310V187a70 70 0 0 1 140 0v123Z" fill="#D99F62" />
      <path d="M342 296V187a58 58 0 0 1 116 0v109Z" fill={`url(#${id}-sky)`} />
      <path d="M400 124v178m-62-78h125" stroke="#D99F62" strokeWidth="11" />
      <path
        d="M323 310h154"
        stroke="#C98E54"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M363 178c5-12 12-19 21-24"
        stroke="#E6F0EE"
        strokeWidth="5"
        strokeLinecap="round"
        opacity=".55"
      />
      {/* Shelf and books. */}
      <path d="m64 164 178 4-2 16-176-4Z" fill="#CD955F" />
      <path
        d="M78 182v18m145-15v17"
        stroke="#BC8652"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path d="m145 165 5-62q0-5 5-5l20 2-4 67Z" fill="#9EBCCC" />
      <path d="m173 166 10-71q0-5 5-4l18 3-9 73Z" fill="#C0BE92" />
      <path d="m197 167 8-62q0-4 4-4l14 3-7 64Z" fill="#E5A27F" />
      <path
        d="m154 108-3 48m39-55-8 55m30-45-5 46"
        stroke="#FFF1D9"
        strokeWidth="2"
        opacity=".4"
      />
      {/* Hanging plant, varied leaves. */}
      <path d="m73 151 4 20h34l6-24Z" fill="#B98D60" />
      <path
        d="M92 145c-19 19-20 43-17 72s-14 41-5 62m30-132c-3 31 8 50 5 70m-21-73c-25 18-34 36-29 60"
        stroke="#6F8650"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <g fill="#8B9C63">
        <ellipse
          cx="66"
          cy="150"
          rx="16"
          ry="12"
          transform="rotate(-32 66 150)"
        />
        <ellipse
          cx="87"
          cy="134"
          rx="15"
          ry="11"
          transform="rotate(-48 87 134)"
        />
        <ellipse
          cx="109"
          cy="139"
          rx="15"
          ry="11"
          transform="rotate(30 109 139)"
        />
        <ellipse
          cx="115"
          cy="159"
          rx="14"
          ry="10"
          transform="rotate(50 115 159)"
        />
        <ellipse
          cx="84"
          cy="177"
          rx="11"
          ry="15"
          transform="rotate(30 84 177)"
        />
        <ellipse
          cx="65"
          cy="202"
          rx="11"
          ry="15"
          transform="rotate(-25 65 202)"
        />
        <ellipse
          cx="79"
          cy="226"
          rx="11"
          ry="16"
          transform="rotate(15 79 226)"
        />
        <ellipse
          cx="62"
          cy="254"
          rx="10"
          ry="15"
          transform="rotate(-20 62 254)"
        />
      </g>
      <g fill="#73864F">
        <ellipse
          cx="101"
          cy="157"
          rx="11"
          ry="15"
          transform="rotate(25 101 157)"
        />
        <ellipse
          cx="62"
          cy="170"
          rx="11"
          ry="15"
          transform="rotate(25 62 170)"
        />
        <ellipse
          cx="96"
          cy="197"
          rx="10"
          ry="14"
          transform="rotate(-30 96 197)"
        />
        <ellipse
          cx="71"
          cy="283"
          rx="9"
          ry="13"
          transform="rotate(-20 71 283)"
        />
      </g>
      {/* Low wooden table. */}
      <ellipse cx="424" cy="475" rx="90" ry="18" fill="#C29973" opacity=".25" />
      <path d="m357 398 4 72 18 5 2-73m101 0-5 77 19-4 7-74" fill="#BE8956" />
      <path d="m379 402 3 63 94 6 3-18-83-5-1-46Z" fill="#A97447" />
      <path d="M343 382q78-21 166 1l3 23q-85 13-172-2Z" fill="#D8A16A" />
      <path
        d="M342 382q82-17 167 1"
        stroke="#E6B883"
        strokeWidth="8"
        strokeLinecap="round"
      />
      {/* Table plant. */}
      <path
        d="M413 353v-68m1 37 22-23m-22 14-19-19"
        stroke="#6B8151"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <g fill="#87965A">
        <ellipse
          cx="398"
          cy="303"
          rx="14"
          ry="25"
          transform="rotate(-42 398 303)"
        />
        <ellipse
          cx="437"
          cy="300"
          rx="15"
          ry="26"
          transform="rotate(37 437 300)"
        />
        <ellipse
          cx="416"
          cy="282"
          rx="15"
          ry="27"
          transform="rotate(-8 416 282)"
        />
        <ellipse
          cx="439"
          cy="326"
          rx="23"
          ry="13"
          transform="rotate(-22 439 326)"
        />
        <ellipse
          cx="393"
          cy="328"
          rx="23"
          ry="13"
          transform="rotate(21 393 328)"
        />
      </g>
      <path d="M387 343h54l-8 35q-16 8-37-1Z" fill="#CB8750" />
      <path
        d="M387 343q28 5 54 0"
        stroke="#DE9A61"
        strokeWidth="7"
        strokeLinecap="round"
      />
      {/* Soft rug and tail. */}
      <ellipse
        cx="229"
        cy="525"
        rx="115"
        ry="29"
        fill="#BF9A72"
        opacity=".58"
      />
      <ellipse
        cx="229"
        cy="525"
        rx="95"
        ry="20"
        stroke="#CFAD85"
        strokeWidth="2"
        strokeDasharray="2 6"
      />
      <path
        d="M184 468c-33 9-69-16-63-51 2-15 15-19 23-8 9 12-2 24 12 32 9 6 18 5 30 3"
        stroke="#B9773F"
        strokeWidth="25"
        strokeLinecap="round"
      />
      <path
        d="M135 435c-8-11-5-18-3-23"
        stroke="#F9EAC8"
        strokeWidth="25"
        strokeLinecap="round"
      />
      <path
        d="M164 449c-13-1-17-5-23-9"
        stroke="#825C44"
        strokeWidth="23"
        strokeLinecap="round"
      />
      {/* Kitten body and paws. */}
      <path
        d="M199 395c-30 22-39 63-30 99l13 26q15 8 29-1l9-11 27 13q24 4 38-10c10-48 8-91-22-115Z"
        fill={`url(#${id}-fur)`}
      />
      <path d="M179 423c-16 22-19 49-9 66 19-9 31-25 33-50Z" fill="#D79B52" />
      <path d="M277 440c-18 10-20 27-13 43l22-9Z" fill="#AD8060" />
      <path
        d="m213 466-3 47q-9 5-8 11c1 9 29 10 34 1l2-53m25-3-4 44q-5 8 1 12c7 5 25 1 24-5"
        fill="#F8EDCC"
      />
      <path
        d="m212 520 1 7m8-7 1 8m49-8 1 7"
        stroke="#DDCAA7"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Ears and face. */}
      <path
        d="m180 326-15-42q-3-11 8-8l39 19m50 0 27-37q6-8 10 2l13 51"
        fill="#B77E51"
        stroke="#9F6C4B"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path d="m177 287 9 29 16-17m79-4 13-23 7 28" fill="#E6AA95" />
      <path
        d="M183 306c29-27 80-25 106 2 21 22 28 55 13 77-20 30-86 41-118 13-29-25-27-64-1-92Z"
        fill={`url(#${id}-fur)`}
      />
      <path
        d="M185 308c13-12 28-17 47-18-1 24-13 29-22 43-12 20-17 28-34 30-8-19-5-39 9-55Z"
        fill="#CD8C45"
      />
      <path d="M272 298c20 7 35 24 37 45-20-3-33-16-37-45Z" fill="#C58B50" />
      <ellipse
        cx="207"
        cy="354"
        rx="16"
        ry="20"
        transform="rotate(-12 207 354)"
        fill="#FFFDF4"
      />
      <ellipse
        cx="266"
        cy="341"
        rx="16"
        ry="20"
        transform="rotate(-15 266 341)"
        fill="#FFFDF4"
      />
      <ellipse
        cx="212"
        cy="354"
        rx="11"
        ry="15"
        transform="rotate(-12 212 354)"
        fill="#3D342D"
      />
      <ellipse
        cx="270"
        cy="341"
        rx="11"
        ry="15"
        transform="rotate(-15 270 341)"
        fill="#3D342D"
      />
      <circle cx="216" cy="347" r="4" fill="white" />
      <circle cx="274" cy="334" r="4" fill="white" />
      <circle cx="209" cy="360" r="2" fill="#FBF3E2" />
      <circle cx="267" cy="347" r="2" fill="#FBF3E2" />
      <path
        d="m236 363 10-2q3 0 1 3l-4 5q-2 2-4 0l-4-3q-2-2 1-3Z"
        fill="#AD7664"
      />
      <path
        d="M243 368c1 10-10 12-12 6m12-6c1 8 10 9 12 2"
        stroke="#694D3D"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <ellipse cx="192" cy="375" rx="10" ry="5" fill="#E9B398" opacity=".65" />
      <ellipse cx="280" cy="363" rx="10" ry="5" fill="#E9B398" opacity=".65" />
      <path
        d="m181 364-28-3m29 12-27 5m131-27 29-9m-26 17 30-1"
        stroke="#9F7957"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Red beret. */}
      <path
        d="M174 312c-4-27 23-47 56-50 31-4 62 12 72 37-48-6-76 1-120 21Z"
        fill="#C6533E"
      />
      <path
        d="M179 315c40-24 81-29 119-15"
        stroke="#AA4335"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="m217 265-3-10"
        stroke="#AF4937"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M206 251c-16 3-27-5-25-17-12-8-8-20 3-25 1-14 15-18 24-13 10-9 23-3 25 7 14 1 20 13 12 23 4 14-9 25-23 22Z"
        fill="#CD503D"
      />
      <path
        d="M192 219c3-9 10-12 16-10"
        stroke="#DD6C53"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Cozy scarf. */}
      <path
        d="M181 393c32 17 76 15 108-9l9 21c-27 26-81 34-123 10Z"
        fill="#748A51"
      />
      <path d="m222 417-8 57q13 8 24 3l15-61" fill="#81965B" />
      <path d="m245 416 2 48q9 7 20 3l-1-59" fill="#6E834D" />
      <path
        d="m218 468-2 12m10-11-1 13m10-12-1 10m16-19 1 12m8-12 1 10m7-11 1 11"
        stroke="#81965B"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Blue water bowl. */}
      <ellipse cx="400" cy="563" rx="68" ry="13" fill="#BC9874" opacity=".35" />
      <path
        d="M348 527c7-20 97-24 107-1l14 32c-1 27-134 29-135 2Z"
        fill={`url(#${id}-bowl)`}
      />
      <ellipse cx="402" cy="528" rx="54" ry="20" fill="#B3CCE2" />
      <ellipse cx="402" cy="529" rx="44" ry="14" fill="#7C9BB9" />
      <path
        d="M373 529c15-7 39-8 58-2"
        stroke="#A1BFD5"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="m391 554-2-7 8 4h8l7-4-1 9c4 16-25 18-22 1" fill="#6E95B7" />
      {/* A little hand-drawn glimmer. */}
      <path
        d="m324 377 2 8m-6-4 10 1m-158-37-5 3"
        stroke="#FFF6DF"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
