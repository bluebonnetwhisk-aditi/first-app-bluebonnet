import React, { useState, useEffect } from "react";
import { 
  Star, 
  Sparkles, 
  MessageSquarePlus, 
  CheckCircle2, 
  HeartHandshake, 
  Calendar, 
  Utensils, 
  Check 
} from "lucide-react";
import { submitToGoogleSheets } from "../services/googleSheets";

export interface ReviewItem {
  id: string;
  name: string;
  occasion: string;
  itemsOrdered: string;
  rating: number; // 1 to 5
  reviewText: string;
  date: string;
  verified?: boolean;
}

const INITIAL_REVIEWS: ReviewItem[] = [
  {
    id: "rev-1",
    name: "Ankita S.",
    occasion: "Daughter's 5th Birthday (Frisco, TX)",
    itemsOrdered: "2-Tier Eggless Rasmalai Cake, Live Pani Puri & Cutlets",
    rating: 5,
    reviewText: "Ordered a 2-tier eggless Rasmalai cake and live pani puri counter for my daughter's 5th birthday in Frisco. Honestly the cake was super soft and not overly sweet like store bought cakes, everyone went for a second slice. Even the pani puri and cutlets got over so fast! They were very patient with all my small changes. Will definitely order again.",
    date: "September 24, 2026"
  },
  {
    id: "rev-2",
    name: "Priya M.",
    occasion: "25th Anniversary Dinner (Plano, TX)",
    itemsOrdered: "Paneer Lababdar, Dal Makhani, Bhindi Masala & Kheer",
    rating: 5,
    reviewText: "We had around 50 guests at home for our anniversary dinner and got Paneer Lababdar, Dal Makhani, Bhindi Masala and Kheer from Bluebonnet Whisk. Food tasted really fresh and homely, not heavy or oily like restaurant catering. My in-laws are visiting from India and even they loved the dal and kheer! Everything was packed neatly and hot on time.",
    date: "September 15, 2026"
  },
  {
    id: "rev-3",
    name: "Siddharth P.",
    occasion: "Weekly Tiffin Service (Irving / Las Colinas, TX)",
    itemsOrdered: "Weekly Dabba: Stuffed Parathas, Kadhi Pakora & Daily Sabzi",
    rating: 5,
    reviewText: "Been taking their weekly dabba for a few months now. With busy office days it is such a relief to get proper ghar ka khana. Rotis stay soft even for dinner, kadhi pakora and stuffed parathas are my favorite. Less oil and no soda feeling afterwards. Highly recommend if you miss home food.",
    date: "August 28, 2026"
  },
  {
    id: "rev-4",
    name: "Meenakshi R.",
    occasion: "Rakhi Gift Boxes (Coppell, TX)",
    itemsOrdered: "25x Custom Rakhi Boxes: Biscoff Cookies & Sweets",
    rating: 5,
    reviewText: "Got 25 Rakhi boxes made for family and clinic staff. The Biscoff cookies and sweets were fresh and the ribbon packing with our family name card looked very nice. Everyone texted me asking where I ordered these from. Very happy with the quality.",
    date: "August 24, 2026"
  },
  {
    id: "rev-5",
    name: "Swati & Rajesh K.",
    occasion: "Ganpati Pooja Catering (McKinney, TX)",
    itemsOrdered: "No-Onion/No-Garlic Menu: Bedmi Poori, Aalu, Shahi Paneer & Jars",
    rating: 5,
    reviewText: "We needed strict no onion no garlic food for our Ganpati pooja at home. Ordered Bedmi Poori, Aalu sabzi, Shahi Paneer and Motichoor jars. Really appreciate how cleanly everything was made, the aalu poori tasted just like back home halwai style. All our guests appreciated the food.",
    date: "August 12, 2026"
  },
  {
    id: "rev-6",
    name: "Kavita D.",
    occasion: "Housewarming Party (Little Elm, TX)",
    itemsOrdered: "Live Jalebi & Rabri, Railway Cutlets & Stuffed Parathas",
    rating: 5,
    reviewText: "Had our housewarming for about 40 people in Little Elm. The live jalebi rabri was the highlight of the evening, hot crispy jalebis right there and guests kept going back for more! Railway cutlets and parathas were also delicious. Portions were very generous and coordinating on WhatsApp was super easy.",
    date: "July 30, 2026"
  },
  {
    id: "rev-7",
    name: "Neha G.",
    occasion: "1st Birthday Party (Southlake, TX)",
    itemsOrdered: "Eggless Jungle Theme 2-Tier Cake & Mango Cups",
    rating: 5,
    reviewText: "Shared a reference picture for my son's 1st birthday jungle theme cake and they made it look even better in person. We opted for eggless mango cream flavor and it was so moist and light. Pricing was very reasonable compared to other custom bakers around DFW.",
    date: "July 18, 2026"
  },
  {
    id: "rev-8",
    name: "Deepak T.",
    occasion: "40th Birthday Get-Together (Prosper, TX)",
    itemsOrdered: "Gulab Jamun Fusion Cake & Chaat Platter",
    rating: 5,
    reviewText: "Ordered the Gulab Jamun cake and chaat items for my 40th birthday party. First time trying a fusion cake like this and all our friends loved it, not too sweet and nice cardamom flavor. Timely pickup and very good communication throughout. Thank you!",
    date: "May 19, 2026"
  }
];

const REVIEWS_STORAGE_KEY = "bbw_customer_reviews_v6";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>(() => {
    try {
      const saved = localStorage.getItem(REVIEWS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_REVIEWS;
  });

  const [showForm, setShowForm] = useState(false);
  const [ratingFilter, setRatingFilter] = useState<number | "all">("all");

  // Form State
  const [reviewerName, setReviewerName] = useState("");
  const [occasion, setOccasion] = useState("");
  const [itemsOrdered, setItemsOrdered] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
    } catch {
      // ignore
    }
  }, [reviews]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!reviewerName.trim() || !occasion.trim() || !itemsOrdered.trim() || !reviewText.trim()) {
      setErrorMessage("Please fill out all required fields (Name, Occasion, Items Ordered, and Review).");
      return;
    }

    setIsSubmitting(true);

    const newReview: ReviewItem = {
      id: `rev-${Date.now()}`,
      name: reviewerName.trim(),
      occasion: occasion.trim(),
      itemsOrdered: itemsOrdered.trim(),
      rating,
      reviewText: reviewText.trim(),
      date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      verified: true
    };

    // Submit to Google Sheets (non-blocking)
    try {
      await submitToGoogleSheets("Customer Reviews", {
        Name: newReview.name,
        Occasion: newReview.occasion,
        ItemsOrdered: newReview.itemsOrdered,
        Rating: newReview.rating,
        Review: newReview.reviewText,
        Date: newReview.date
      });
    } catch {
      // Continue even if sheet submit fails
    }

    setReviews(prev => [newReview, ...prev]);
    setIsSubmitting(false);
    setSuccessMessage(true);

    // Reset Form
    setReviewerName("");
    setOccasion("");
    setItemsOrdered("");
    setRating(5);
    setReviewText("");

    setTimeout(() => {
      setSuccessMessage(false);
      setShowForm(false);
    }, 3000);
  };

  const filteredReviews = (ratingFilter === "all" 
    ? reviews 
    : reviews.filter(r => r.rating === ratingFilter)
  ).slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const averageRating = (
    reviews.reduce((acc, curr) => acc + curr.rating, 0) / (reviews.length || 1)
  ).toFixed(1);

  return (
    <div className="royal-dark-page bg-[#050a1a] min-h-screen py-10 lg:py-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-[#ffdea5]/40 text-[#775a19] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 border border-[#775a19]/20">
            <HeartHandshake className="w-3.5 h-3.5 text-[#775a19]" />
            <span>Customer Stories &amp; Feedback</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#00346f] tracking-tight mb-4">
            Guest Reviews &amp; Testimonials
          </h1>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            Read experiences from host families and corporate events across Frisco, Plano, Little Elm, and greater Dallas-Fort Worth.
          </p>
          <div className="h-0.5 w-16 bg-[#775a19] mt-6 mx-auto" />
        </div>

        {/* Rating Summary & Action Banner */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="bg-[#00346f] text-white p-6 rounded-2xl flex flex-col items-center justify-center min-w-[140px]">
              <span className="font-serif text-4xl sm:text-5xl font-bold leading-none text-[#ffdea5]">
                {averageRating}
              </span>
              <div className="flex items-center gap-1 my-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-4 h-4 fill-[#ffdea5] text-[#ffdea5]" />
                ))}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-200">
                {reviews.length} Customer Reviews
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="font-serif text-xl font-bold text-[#00346f]">
                Fresh, Scratch-Cooked Quality
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm max-w-md leading-relaxed">
                Handcrafted daily with fresh ingredients, eggless options available on request (+$), and 24h/48h notice for hot catering.
              </p>
              <div className="flex items-center gap-4 pt-2 text-xs font-semibold text-[#775a19]">
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Eggless Available (+$)
                </span>
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Fresh Daily
                </span>
              </div>
            </div>
          </div>

          <div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="min-h-[48px] inline-flex items-center justify-center gap-2 bg-[#775a19] hover:bg-[#5d4201] text-white font-sans text-xs uppercase tracking-wider font-bold px-7 py-3 rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              <MessageSquarePlus className="w-4 h-4 text-[#ffdea5]" />
              <span>{showForm ? "Close Review Form" : "Share Your Experience"}</span>
            </button>
          </div>
        </div>

        {/* Drop a Review Form */}
        {showForm && (
          <div className="bg-white border-2 border-[#00346f]/20 rounded-2xl p-6 sm:p-8 shadow-xl mb-12 animate-fade-in">
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center space-y-1">
                <span className="text-[11px] font-bold text-[#775a19] uppercase tracking-widest block font-sans">
                  WE VALUE YOUR FEEDBACK
                </span>
                <h2 className="font-serif text-2xl font-bold text-[#00346f]">
                  Drop a Customer Review
                </h2>
                <p className="text-gray-500 text-xs font-sans">
                  Tell us about your occasion, the dishes you enjoyed, and rate your experience out of 5 stars.
                </p>
              </div>

              {successMessage && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-semibold flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Thank you! Your review has been successfully submitted and published.</span>
                </div>
              )}

              {errorMessage && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl text-xs font-medium">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmitReview} className="space-y-5">
                
                {/* 1. Name & Rating Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                      Your Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#00346f] focus:border-[#00346f] outline-none font-sans"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                      Star Rating (1 to 5) <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center gap-2 pt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 cursor-pointer transition-transform hover:scale-110 focus:outline-none"
                          aria-label={`Rate ${star} star`}
                        >
                          <Star
                            className={`w-7 h-7 ${
                              star <= (hoverRating || rating)
                                ? "fill-[#775a19] text-[#775a19]"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-[#775a19] ml-2 font-serif">
                        {hoverRating || rating} / 5 Stars
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Occasion Detail & Things Ordered */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                      Occasion / Event Detail <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={occasion}
                      onChange={(e) => setOccasion(e.target.value)}
                      placeholder="e.g. 1st Birthday Party, Wedding Sangeet, Pooja"
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#00346f] focus:border-[#00346f] outline-none font-sans"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                      Things Ordered / Dishes Supplied <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={itemsOrdered}
                      onChange={(e) => setItemsOrdered(e.target.value)}
                      placeholder="e.g. Rasmalai Cake & Live Chaat Counter"
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#00346f] focus:border-[#00346f] outline-none font-sans"
                    />
                  </div>
                </div>

                {/* 3. Written Review Text */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                    Your Review / Feedback <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share details of how the food tasted, presentation, and overall experience..."
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#00346f] focus:border-[#00346f] outline-none font-sans"
                  />
                </div>

                {/* Submit button */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="min-h-[44px] px-5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold uppercase tracking-wider text-gray-600 hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="min-h-[44px] inline-flex items-center justify-center gap-2 bg-[#00346f] hover:bg-[#00224d] text-white font-sans text-xs uppercase tracking-widest font-bold px-8 py-2.5 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4 text-[#ffdea5]" />
                    <span>{isSubmitting ? "Publishing..." : "Submit Review"}</span>
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* Filter bar by Star Rating */}
        <div className="flex items-center justify-between gap-4 flex-wrap mb-8 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider font-sans">
              Filter by Rating:
            </span>
            {[
              { id: "all", label: "All Reviews" },
              { id: 5, label: "5 Stars ★" },
              { id: 4, label: "4 Stars ★" }
            ].map(f => (
              <button
                key={String(f.id)}
                onClick={() => setRatingFilter(f.id as number | "all")}
                className={`min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  ratingFilter === f.id
                    ? "bg-[#00346f] text-white shadow-2xs"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <span className="text-xs text-gray-500 font-medium font-sans">
            Showing {filteredReviews.length} of {reviews.length} reviews
          </span>
        </div>

        {/* Reviews Cards List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                
                {/* User & Rating Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#00346f] text-[#ffdea5] flex items-center justify-center font-bold font-serif text-sm border border-[#775a19]/30 shrink-0">
                      {rev.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-serif text-base font-bold text-[#00346f] leading-tight flex items-center gap-1.5">
                        <span>{rev.name}</span>
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-gray-500 font-sans mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400" /> {rev.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Star Rating Badge */}
                  <div className="flex items-center gap-0.5 bg-[#faf7f2] border border-[#775a19]/20 px-2.5 py-1 rounded-lg">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating ? "fill-[#775a19] text-[#775a19]" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Occasion & Dishes Ordered Tags */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#ffdea5]/40 text-[#775a19] px-2.5 py-0.5 rounded-md font-sans border border-[#775a19]/20">
                    Occasion: {rev.occasion}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-md font-sans flex items-center gap-1">
                    <Utensils className="w-3 h-3 text-gray-500" />
                    {rev.itemsOrdered}
                  </span>
                </div>

                {/* Review Text */}
                <p className="text-gray-700 text-xs sm:text-sm leading-relaxed font-sans pt-1">
                  &ldquo;{rev.reviewText}&rdquo;
                </p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 font-sans">
                <span>Little Elm / Frisco / DFW Guest</span>
                <span className="text-[#775a19] font-semibold flex items-center gap-1">
                  <span>★ {rev.rating}.0 Rating</span>
                </span>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
